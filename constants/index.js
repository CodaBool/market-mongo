export const PRODUCTS_PER_PAGE = 10
export const MAX_DUP_ITEMS = 3
export const SHIPPING_COST = 7.99
export const SHIPPING_EST = '2-4 Business Days'
export const CATEGORY = ['Apparel', 'Electronic', 'Home', 'Grocery', 'Health', 'Toys', 'Handmade', 'Sports', 'Outdoors']
export const USA_STATES = [
  'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA',
  'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA',
  'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND',
  'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT',
  'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY'
]

export function usdPretty(price) {
  if (!price) return <p className="text-danger">Undefined Price</p>
  return (
    <h3 className="money">
      <span className="align-top" style={{ lineHeight: '1.7em', fontSize: '0.6em' }}>$</span>
      {String(price).slice(0, -2)}
      <span className="d-inline align-top" style={{ lineHeight: '1.6em', fontSize: '0.6em' }}>{String(price).slice(-2)}</span>
    </h3>
  )
}
export function convertPayPalAmount(amount) {
  return Number(amount.replace('.', ''))
}
export function usd(price) {
  return String(price).slice(0, -2) + '.' + String(price).slice(-2, String(price).length)
}
export function genQuanArr(quantity) {
  if (quantity > MAX_DUP_ITEMS) return Array.from({ length: MAX_DUP_ITEMS }, (x, i) => i + 1)
  return Array.from({ length: quantity }, (x, i) => i + 1)
}

export function genHexFromString(seed) {
  let color = ''
  color = Math.floor((Math.abs(Math.sin(seed.charCodeAt(0)) * 16777215)) % 16777215)
  color = color.toString(16)
  while (color.length < 6) {
    color = '0' + color
  }
  return color
}

export function createOrderValidation(source, cart, vendor) {
  const vendorLines = [], orderLines = []

  if (!cart) throw 'No products in cart'

  let total = 0
  let line = {}, monLine = {}
  for (const id in cart) {
    // console.log('loop id=', id)
    const item = source.find(product => (product._id === cart[id].productId))
    const variant = item.variants.find(variant => String(variant._id) === id)
    // console.log('variant', variant)
    // console.log('match', item, '@', id)
    // verify that all ids exist in source
    if (!item) throw `No product in source with id "${cart[id].productId}"`
    if (!variant) throw `The variant of id "${id}" was not found in product "${cart[id].productId}"`
    // verify that the local has the correct price
    // console.log('compare price', cart[id].price, 'vs', item.price)
    if (cart[id].price !== variant.price) throw 'Price discrepency'

    // verify that the local does not go over store duplicate limit
    // console.log('check if over max', cart[id].quantity, 'vs', MAX_DUP_ITEMS)
    if (cart[id].quantity > MAX_DUP_ITEMS) throw 'Exceeding max per customer limit'

    // verify that the local does not go over store supply
    // console.log('check if over supply', cart[id].quantity, 'vs', item.quantity)
    if (cart[id].quantity > variant.quantity) throw 'Exceeding supply limit'

    // don't allow empty quantity
    if (cart[id].quantity === 0) throw 'Empty quantity'

    if (!variant.images[0]) throw 'Improper market image'
    // if (!item.description) throw 'Improper market description'
    // if (!item.currency) throw 'Improper market currency'

    if (vendor === 'paypal') {
      line = {
        sku: variant._id,
        name: variant.name,
        quantity: cart[id].quantity,
        description: item.description.substring(0, 120) + '... ', // max 127
        unit_amount: {
          currency_code: item.currency,
          value: usd(variant.price)
        }
      }
    } else { // stripe
      line = {
        quantity: cart[id].quantity,
        price_data: {
          currency: item.currency,
          unit_amount: variant.price,
          product_data: {
            name: variant.name,
            description: item.description,
            images: variant.images
          }
        }
      }
    }
    monLine = {
      id_prod: item._id,
      name: variant.name,
      currency: item.currency,
      quantity: cart[id].quantity,
      id_variant: variant._id,
      value: variant.price
    }

    total += (variant.price * cart[id].quantity)
    vendorLines.push(line)
    orderLines.push(monLine)
  }

  return { vendorLines, total, orderLines }
}

export function itemsValidation(products, items, amount_received) {
  let validatedItems = []
  let expected = 0
  let paid = 0
  let issues = false
  for (const item of items) {
    const product = products.find(product => item.id_prod === product._id)
    console.log('product', product)
    const variant = product.variants.find(variant => String(item.id_variant) === String(variant._id))
    console.log('variant', variant)
    expected += variant.price * item.quantity
    console.log('expected', variant.price, '*', item.quantity, ' = ', expected)

    // console.log('generating expect comparison values', product.price, '*', item.quantity, '===', item.value, '*', item.quantity)
    // console.log('generating expect comparison result', product.price * item.quantity, '===', item.value * item.quantity, )
    // console.log((product.price * item.quantity === item.value * item.quantity))

    validatedItems.push({
      id: product._id,
      currency: product.currency === item.currency ? true : `${product.currency}!=${item.currency}`,
      quantity: variant.quantity < item.quantity ? `${variant.quantity}<${item.quantity}` : true,
      price: variant.price === item.value ? true : `${variant.price}!=${item.value}`,
    })
    
  }
  const details = validatedItems.filter(item => item.currency !== true || item.price !== true || item.quantity !== true)

  paid = amount_received
  if (details.length > 0) {
    console.log('itemsValidation ISSUES:', details.length, '>', 0)
    issues = true
  }
  if (paid !== expected) {
    console.log('itemsValidation PAYMENT:', paid, '!==', expected)
    issues = true
  }
  if (!issues) return { wh_verified: true, issues }
  return { wh_verified: true, details, expected: expected, issues, paid }
}

export function randString(size) { // max 66
  const value = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
  console.log(value)
  if (size) return value.slice(0, size)
  return value
}

export function extractRelevantData(source) {
  let obj = {}
  if (source.client_secret) { // stripe
    const charges = source.charges.data.map(charge => ({
      _id: charge.id,
      paid: charge.paid,
      currency: charge.currency,
      captured: charge.captured,
      pay_status: charge.status,
      refunded: charge.refunded,
      amount: charge.amount_captured,
      receipt_url: charge.receipt_url,
      receipt_email: charge.receipt_email,
      receipt_number: charge.receipt_number,
      risk_level: charge.outcome.risk_level,
      risk_score: charge.outcome.risk_score,
      card: charge.payment_method_details.card,
      created: new Date(charge.created * 1000).toISOString(),
    }))
    obj = {
      charges,
      status: 'complete',
      pay_status: source.status,
      shipping: source.shipping,
      client_secret: source.client_secret,
      amount_received: source.amount_received,
      id_stripe_payment_method: source.id_payment_method,
    }
  } else { // paypal
    console.log('you passed a paypal order, and this is not yet built to handle that!')
  }
  return obj
}

export function validateOrder(products, order, intent) {
  const { validatedItems, totalPrice } = validateItems(products, order.items)
  return false
  // return {
  //   wh_verified: true,
  //   completely_valid: false,
  //   price: totalPrice === order.amount ? true : `${totalPrice}!=${order.amount}`,
  //   quantity: product.currency === order.currency ? true : `${product.currency}!=${order.currency}`,
  // }
}


export function validateItems(products, items) {
  if (!items) throw 'No items'
  let validatedItems = []
  let totalPrice = 0
  for (const item of items) {
    const product = products.find(product => item.id_prod === product._id)
    validatedItems.push({
      id: product._id,
      currency: product.currency === item.currency ? true : `${product.currency}!=${item.currency}`,
      quantity: product.quantity < item.quantity ? `${product.quantity}<${item.quantity}` : true,
      price: product.price === item.value ? true : `${product.price}!=${item.value}`
    })
    totalPrice += product.price * item.quantity
  }
  return { validatedItems, totalPrice }
}

export function getState(zipString) { // Get State from Zip Code
  if (typeof zipString !== 'string' || zipString.length !== 5 || !zipString.match(/^[0-9]+$/)) {
    return undefined
  }

  const zipcode = parseInt(zipString, 10);
  let st

  if (zipcode >= 35000 && zipcode <= 36999) {
    st = 'AL';
  } else if (zipcode >= 99500 && zipcode <= 99999) {
    st = 'AK';
  } else if (zipcode >= 85000 && zipcode <= 86999) {
    st = 'AZ';
  } else if (zipcode >= 71600 && zipcode <= 72999) {
    st = 'AR';
  } else if (zipcode >= 90000 && zipcode <= 96699) {
    st = 'CA';
  } else if (zipcode >= 80000 && zipcode <= 81999) {
    st = 'CO';
  } else if (zipcode >= 6000 && zipcode <= 6999) {
    st = 'CT';
  } else if (zipcode >= 19700 && zipcode <= 19999) {
    st = 'DE';
  } else if (zipcode >= 32000 && zipcode <= 34999) {
    st = 'FL';
  } else if (zipcode >= 30000 && zipcode <= 31999) {
    st = 'GA';
  } else if (zipcode >= 96700 && zipcode <= 96999) {
    st = 'HI';
  } else if (zipcode >= 83200 && zipcode <= 83999) {
    st = 'ID';
  } else if (zipcode >= 60000 && zipcode <= 62999) {
    st = 'IL';
  } else if (zipcode >= 46000 && zipcode <= 47999) {
    st = 'IN';
  } else if (zipcode >= 50000 && zipcode <= 52999) {
    st = 'IA';
  } else if (zipcode >= 66000 && zipcode <= 67999) {
    st = 'KS';
  } else if (zipcode >= 40000 && zipcode <= 42999) {
    st = 'KY';
  } else if (zipcode >= 70000 && zipcode <= 71599) {
    st = 'LA';
  } else if (zipcode >= 3900 && zipcode <= 4999) {
    st = 'ME';
  } else if (zipcode >= 20600 && zipcode <= 21999) {
    st = 'MD';
  } else if (zipcode >= 1000 && zipcode <= 2799) {
    st = 'MA';
  } else if (zipcode >= 48000 && zipcode <= 49999) {
    st = 'MI';
  } else if (zipcode >= 55000 && zipcode <= 56999) {
    st = 'MN';
  } else if (zipcode >= 38600 && zipcode <= 39999) {
    st = 'MS';
  } else if (zipcode >= 63000 && zipcode <= 65999) {
    st = 'MO';
  } else if (zipcode >= 59000 && zipcode <= 59999) {
    st = 'MT';
  } else if (zipcode >= 27000 && zipcode <= 28999) {
    st = 'NC';
  } else if (zipcode >= 58000 && zipcode <= 58999) {
    st = 'ND';
  } else if (zipcode >= 68000 && zipcode <= 69999) {
    st = 'NE';
  } else if (zipcode >= 88900 && zipcode <= 89999) {
    st = 'NV';
  } else if (zipcode >= 3000 && zipcode <= 3899) {
    st = 'NH';
  } else if (zipcode >= 7000 && zipcode <= 8999) {
    st = 'NJ';
  } else if (zipcode >= 87000 && zipcode <= 88499) {
    st = 'NM';
  } else if (zipcode >= 10000 && zipcode <= 14999) {
    st = 'NY';
  } else if (zipcode >= 43000 && zipcode <= 45999) {
    st = 'OH';
  } else if (zipcode >= 73000 && zipcode <= 74999) {
    st = 'OK';
  } else if (zipcode >= 97000 && zipcode <= 97999) {
    st = 'OR';
  } else if (zipcode >= 15000 && zipcode <= 19699) {
    st = 'PA';
  } else if (zipcode >= 300 && zipcode <= 999) {
    st = 'PR';
  } else if (zipcode >= 2800 && zipcode <= 2999) {
    st = 'RI';
  } else if (zipcode >= 29000 && zipcode <= 29999) {
    st = 'SC';
  } else if (zipcode >= 57000 && zipcode <= 57999) {
    st = 'SD';
  } else if (zipcode >= 37000 && zipcode <= 38599) {
    st = 'TN';
  } else if ((zipcode >= 75000 && zipcode <= 79999) || (zipcode >= 88500 && zipcode <= 88599)) {
    st = 'TX';
  } else if (zipcode >= 84000 && zipcode <= 84999) {
    st = 'UT';
  } else if (zipcode >= 5000 && zipcode <= 5999) {
    st = 'VT';
  } else if (zipcode >= 22000 && zipcode <= 24699) {
    st = 'VA';
  } else if (zipcode >= 20000 && zipcode <= 20599) {
    st = 'DC';
  } else if (zipcode >= 98000 && zipcode <= 99499) {
    st = 'WA';
  } else if (zipcode >= 24700 && zipcode <= 26999) {
    st = 'WV';
  } else if (zipcode >= 53000 && zipcode <= 54999) {
    st = 'WI';
  } else if (zipcode >= 82000 && zipcode <= 83199) {
    st = 'WY';
  } else {
    st = undefined;
    // console.log('No state found matching', zipcode);
  }
  return st;
}
