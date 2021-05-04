const stripe = require('stripe')(process.env.STRIPE_SK)
// const validateSKU = require('use-shopping-cart/utilities').validateCartItems // only checks that each sku exists 

const inventory = [
  {
    "name": "New Valencia Product",
    "sku": "prod_IWYxENlgBE5gIx",
    "price": 991,
    "image": "https://files.stripe.com/links/fl_test_tbN5CakXUa74ea6hnFdPaiUs",
    "currency": "usd"
  },
  {
    "name": "lol xd random",
    "sku": "prod_IJ2asdCfoO1Go5",
    "price": 999,
    "image": "https://files.stripe.com/links/fl_test_OjJltdq7JWUQB6ni5NQIhmZm",
    "currency": "usd"
  },
  {
    "name": "lol xd randosdfsdm",
    "sku": "prod_IETwLgxefSHPPv",
    "price": 150,
    "image": "https://files.stripe.com/links/fl_test_F5RMQIftj5XYCKI4Ds37SifT",
    "currency": "usd"
  }
]

export default async (req, res) => {
  try {
    const { method, body, query } = req
    if (method === 'POST') {
      console.log('in api with cart', body)
      // const line_items = validate(inventory, body) // throws if sku cannot be found
      // console.log('line_items', JSON.stringify(line_items, null, 2))
      // console.log('line_items', formatLineItems(line_items, null, 2))

      /*  CUSTOM VALIDATION WITHOUT PRICE API
        quantity: amount being purchased
        price_data: {
          currency: 'USD',
          unit_amount: 1
          product_data: {
            name: product name,
            images: []
          }
        }
      */
      /*  SIMPLIER
        price: 'price_1InUzEAJvGrE9xG5IAYLtrZv',
        quantity: 1
      */
      // const session = await stripe.checkout.sessions.create({
      //   success_url: 'https://example.com/success',
      //   cancel_url: 'https://example.com/cancel',
      //   payment_method_types: ['card'],
      //   line_items,
      //   mode: 'payment',
      // });

      // return {
      //   statusCode: 200,
      //   body: JSON.stringify({ sessionId: session.id })
      // }
      res.status(200).json({msg: 'nice'})
    } else if (method === 'GET') {
      throw 'bad route'
    } else if (method === 'PUT') {
      throw 'bad route'
    } else {
      throw `Cannot use ${method} method for this route`
    }
  } catch (err) {
    console.log('type', typeof err)
    console.log('raw', err)
    if (typeof err === 'string') {
      res.status(400).json({ msg: 'session: ' + err })
    } else {
      res.status(500).json({ msg: 'session: ' + (err.message || err)})
    }
  }
}

// copy of use-shopping-cart@3.0.0-beta.5 validateCartItems
// Lacked validation quantity and price, only validated SKU
// Due to this limitation. Creating local version which will validate
// for all 3 (price, sku, quantity) and return in proper Stripe line_items format

const validate = (inventorySrc, cartDetails) => {
  const validatedItems = []

  for (const id in cartDetails) {
    // const product = cartDetails[itemId]
    const inventoryItem = inventorySrc.find(
      (currentProduct) => currentProduct.sku === id || currentProduct.id === id
    )
    if (inventoryItem === undefined) {
      throw new Error(
        `Invalid Cart: product with id "${id}" is not in your inventory.`
      )
    }

    const item = {
      price_data: {
        currency: inventoryItem.currency,
        unit_amount: inventoryItem.price,
        product_data: {
          name: inventoryItem.name,
          ...inventoryItem.product_data
        },
        ...inventoryItem.price_data
      },
      quantity: cartDetails[id].quantity
    }

    if (typeof cartDetails[id].product_data?.metadata === 'object') {
      item.price_data.product_data.metadata = {
        ...item.price_data.product_data.metadata,
        ...cartDetails[id].product_data.metadata
      }
    }

    if (
      typeof inventoryItem.description === 'string' &&
      inventoryItem.description.length > 0
    )
      item.price_data.product_data.description = inventoryItem.description

    if (
      typeof inventoryItem.image === 'string' &&
      inventoryItem.image.length > 0
    )
      item.price_data.product_data.images = [inventoryItem.image]

    validatedItems.push(item)
  }

  return validatedItems
}