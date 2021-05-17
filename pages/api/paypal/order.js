import { getSession } from 'coda-auth/client'
import sdk from '@paypal/checkout-server-sdk'
import { connectDB, castToObjectId } from '../../../util/db'
import { User, Order, Product } from '../../../models'
import { MAX_DUP_ITEMS, usd } from '../../../constants'
import axios from 'axios'

export default async (req, res) => {
  try {
    const session = await getSession({ req })
    if (!session) throw 'Unauthorized'
    const { method, body, query, headers } = req

    const env = new sdk.core.SandboxEnvironment(process.env.NEXT_PUBLIC_PAYPAL_ID, process.env.PAYPAL_SK)
    const paypal = new sdk.core.PayPalHttpClient(env)

    if (method === 'POST') {
      if (body.orderID) { // capture order

        console.log('\n============ CAPTURE ============')
        const request = new sdk.orders.OrdersCaptureRequest(body.orderID)
        request.requestBody({})
        const capture = await paypal.execute(request)

        const charges = capture.result.purchase_units.map(unit => ({
          _id: unit.payments.captures[0].id,
          id_user: session.id,
          amount: Number(unit.payments.captures[0].amount.value.replace('.', '')), // should only do this for USD
          amount_refunded: 0,
          created: unit.payments.captures[0].create_time,
          currency: unit.payments.captures[0].amount.currency_code,
          refunded: false,
          status: unit.payments.captures[0].status,
        }))

        const orderData = {
          _id: capture.result.id, // replace with stripe intent id
          user: session.id,
          vendor: 'paypal',
          id_customer: capture.result.payer.payer_id,
          amount_received: Number(capture.result.purchase_units[0].payments.captures[0].amount.value.replace('.', '')), // should only do this for USD
          client_secret: body.facilitatorAcessToken,
          created: capture.result.purchase_units[0].payments.captures[0].create_time,
          currency: capture.result.purchase_units[0].payments.captures[0].amount.currency_code,
          livemode: 'NODE_ENV=' + process.env.NODE_ENV,
          status: capture.result.status,
          shipping: capture.result.purchase_units[0].shipping,
          valid: { wh_verified: false },
          charges
        }
        await connectDB()
        const order = await Order.create(orderData)
        console.log('order', order)
        console.log('================================')
        res.status(200).json(order)
      } else { // create order

        console.log('\n============ CREATE =============')
        await connectDB()
        const products = await Product.find()
        const { items, total } = validate(products, body)
        const request = new sdk.orders.OrdersCreateRequest()
        request.prefer("return=representation")
        request.requestBody({
          intent: 'CAPTURE',
          application_context: {
            shipping_preference: 'GET_FROM_FILE'
          },
          purchase_units: [{
            items,
            amount: {
              currency_code: 'USD',
              value: usd(total),
              breakdown: { // https://developer.paypal.com/docs/api/orders/v2/#definition-amount_breakdown
                item_total: {
                  currency_code: 'USD',
                  value: usd(total)
                }, // handling, shipping, discount
              }
            }
          }]
        })
        const order = await paypal.execute(request).catch(err => {
          console.log(JSON.parse(err._originalError.text))
        })
        console.log(order.result.id, '|', items.length,'items @', usd(total), )
        console.log('=================================')
        res.status(200).json(order)
        
      }
    } else if (method === 'GET') {
      // res.status(200).json({msg: 'hi'})
      throw 'bad route'
    } else if (method === 'PUT') {
      throw 'bad route'
    } else {
      throw `Cannot use ${method} method for this route`
    }
  } catch (err) {
    console.log(err)
    if (typeof err === 'string') {
      res.status(400).json({ msg: 'order: ' + err })
    } else {
      res.status(500).json({ msg: 'order: ' + (err.message || err)})
    }
  }
}

async function storeOrder(body, paypal, headers) {
  console.log(JSON.stringify(body, null, 4))
  if (!body.details || !body.data) throw 'Missing data'

  // basic verification
  console.log('checking', process.env.PAYPAL_MERCHANT_ID, body.details.purchase_units[0].payee.merchant_id)
  console.log('checking', process.env.PAYPAL_SANDBOX_SELLER_ACCOUNT, body.details.purchase_units[0].payee.email_address)
  if (process.env.PAYPAL_MERCHANT_ID !== body.details.purchase_units[0].payee.merchant_id) throw 'Unauthorized'
  if (process.env.PAYPAL_SANDBOX_SELLER_ACCOUNT !== body.details.purchase_units[0].payee.email_address) throw 'Unauthorized'

  // full verification
  // const paypalOrder = await axios.get(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${body.details.id}`, {
  //   auth: {
  //     username: process.env.NEXT_PUBLIC_PAYPAL_ID,
  //     password: process.env.PAYPAL_SK
  //   },
  // }).then(res => res.data)
  //   .catch(err => err.response.data)
  //   .catch(console.log)

  const res = await paypal.execute({
    verb: "GET",
    path: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${body.details.id}`,
    headers: { "Content-Type": "application/json" }
  }).catch(console.log)

  console.log(res)
  
  // default error obj which should be overridden
  let valid = { error: `No such PayPal order "${body.details.id}"`, wh_verified: false }
  if (paypalOrder) {
    // console.log('paypal order to verify against', JSON.stringify(paypalOrder, null, 4))
    valid = {
      wh_verified: false,
      id: paypalOrder.id === body.details.id ? true : `${paypalOrder.id}!=${body.details.id}`,
      status: paypalOrder.status === 'COMPLETE' ? true : `${paypalOrder.status}!=COMPLETE`,
      local_amount: 
        paypalOrder.purchase_units[0].amount.value === usd(body.price)
          ? true
          : `${paypalOrder.purchase_units[0].amount.value}!=${usd(body.price)}`,
      req_amount: 
        paypalOrder.purchase_units[0].amount.value === body.details.purchase_units[0].payments.captures[0].amount.value 
          ? true 
          : `${paypalOrder.purchase_units[0].amount.value}!=${body.details.purchase_units[0].payments.captures[0].amount.value}`,
      currency: 
        paypalOrder.purchase_units[0].payments.captures[0].amount.currency_code === body.details.purchase_units[0].payments.captures[0].amount.currency_code 
          ? true 
          : `${paypalOrder.purchase_units[0].payments.captures[0].amount.currency_code}!=${body.details.purchase_units[0].payments.captures[0].amount.currency_code}`,
      status: 
        paypalOrder.purchase_units[0].payments.captures[0].status === body.details.purchase_units[0].payments.captures[0].status
          ? true 
          : `${paypalOrder.purchase_units[0].payments.captures[0].status}!=${body.details.purchase_units[0].payments.captures[0].status}`,
      payerID: 
        paypalOrder.payer.payer_id === body.data.payerID
          ? true 
          : `${paypalOrder.payer.payer_id}!=${body.data.payerID}`,
    }

    console.log('order validation', {
      id: `${paypalOrder.id} = ${body.details.id} | ${valid.id}`,
      status: `${paypalOrder.status} = COMPLETE  | ${valid.status}`,
      local_amount: `${paypalOrder.purchase_units[0].amount.value} = ${usd(body.price)}  | ${valid.local_amount}`,
      req_amount: `${paypalOrder.purchase_units[0].amount.value} = ${body.details.purchase_units[0].payments.captures[0].amount.value}  | ${valid.req_amount}`,
      currency: `${paypalOrder.purchase_units[0].payments.captures[0].amount.currency_code} = ${body.details.purchase_units[0].payments.captures[0].amount.currency_code}  | ${valid.currency}`,
      status: `${paypalOrder.purchase_units[0].payments.captures[0].status} = ${body.details.purchase_units[0].payments.captures[0].status}  | ${valid.status}`,
      payerID: `${paypalOrder.payer.payer_id} = ${body.data.payerID}  | ${valid.payerID}`,
    })
  }


  const charge = {
    _id: body.details.purchase_units[0].payments.captures[0].id,
    id_user: session.id,
    amount: Number(body.details.purchase_units[0].payments.captures[0].amount.value.replace('.', '')), // should only do this for USD
    amount_refunded: 0,
    created: body.details.purchase_units[0].payments.captures[0].create_time,
    currency: body.details.purchase_units[0].payments.captures[0].amount.currency_code,
    refunded: false,
    status: body.details.purchase_units[0].payments.captures[0].status,
  }
  const orderData = {
    _id: body.details.id, // replace with stripe intent id
    user: session.id,
    vendor: 'paypal',
    id_customer: body.data.payerID,
    amount_received: body.details.purchase_units[0].amount.value,
    client_secret: body.data.facilitatorAccessToken,
    created: body.details.create_time,
    currency: body.details.purchase_units[0].amount.currency_code,
    livemode: 'NODE_ENV=' + process.env.NODE_ENV,
    status: body.details.status,
    shipping: body.details.purchase_units[0].shipping,
    valid,
    charges: [charge]
  }
  console.log('providing order data', orderData)
  await connectDB()
  const order = await Order.create(orderData)
  console.log('order', order)
  return order
}

function validate(source, cart) {
  const items = []
  
  if (!cart) throw 'No products in cart'

  let total = 0
  
  for (const id in cart) {
    // console.log(source)
    const item = source.find(product => product._id === id)
    // console.log('match', item, '@', id)
    // verify that all ids exist in source
    if (!item) throw `No product in source with id "${id}"`
    // verify that the local has the correct price
    // console.log('compare price', cart[id].price, 'vs', item.price)
    if (cart[id].price !== item.price) throw 'Price discrepency'

    // verify that the local does not go over store duplicate limit
    // console.log('check if over max', cart[id].quantity, 'vs', MAX_DUP_ITEMS)
    if (cart[id].quantity > MAX_DUP_ITEMS) throw 'Exceeding max per customer limit'
    
    // verify that the local does not go over store supply
    // console.log('check if over supply', cart[id].quantity, 'vs', item.quantity)
    if (cart[id].quantity > item.quantity) throw 'Exceeding supply limit'
    
    // don't allow empty quantity
    if (cart[id].quantity === 0) throw 'Empty quantity'

    if (!item.images[0]) throw 'Improper market image'
    // if (!item.description) throw 'Improper market description'
    // if (!item.currency) throw 'Improper market currency'

    const line = {
      // sku: 
      name: item.name,
      quantity: cart[id].quantity,
      description: item.description.substring(0, 120) + '... ', // max 127
      unit_amount: {
        currency_code: item.currency || 'USD', // TODO: WARNING default should come from MONGO
        value: usd(item.price)
      }
    }
    total += (item.price * cart[id].quantity)
    items.push(line)
  }

  return {items, total}
}

export function getOrderShipping(id) {
  return axios.get(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${id}`, {
    auth: {
      username: process.env.NEXT_PUBLIC_PAYPAL_ID,
      password: process.env.PAYPAL_SK
    },
  }).then(res => {
    if (res.data.purchase_units[0].shipping) {
      console.log('FOUND SHIPPING')
    } else {
      console.log('no shipping tied to order')
    }
    return res.data.purchase_units[0].shipping
  })
}