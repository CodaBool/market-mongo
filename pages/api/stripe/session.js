const stripe = require('stripe')(process.env.STRIPE_SK)
import { getSession } from 'coda-auth/client'
import { Product, Order } from '../../../models'
import applyMiddleware from '../../../util'
import { MAX_DUP_ITEMS } from '../../../constants'

export default applyMiddleware(async (req, res) => {
  try {

    // Authenticate
    const jwt = await getSession({ req })
    if (!jwt) throw 'Unauthorized'

    const { method, body, query } = req
    if (method === 'POST') {

      const products = await Product.find()
      const line_items = validate(products, body)
      const session = await stripe.checkout.sessions.create({
        success_url: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/checkout/confirmed?id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/checkout/cancelled?id={CHECKOUT_SESSION_ID}`,
        metadata: { id: jwt.id, email: jwt.user.email },
        payment_method_types: ['card'],
        customer: jwt.customerId,
        mode: 'payment',
        line_items,
        // shipping_rates: 1,
        shipping_address_collection: {
          allowed_countries: ['US']
        },
      })

      const order = await Order.create({
        _id: session.payment_intent,
        user: jwt.id,
        vendor: 'stripe',
        id_customer: jwt.customerId,
        id_payment_method: 'card',
        payment_status: session.payment_status,
        metadata: session.metadata,
        amount_intent: session.amount_total,
        amount_capturable: session.amount_total,
        amount_received: 0,
        created: new Date().toISOString(),
        currency: session.currency,
        livemode: session.livemode,
        status: 'created',
        valid: { wh_verified: false },
        client_secret: null,
        shipping: null,
        charges: null
      })

      console.log('order created', order._id)

      res.status(200).json({id: session.id})

    } else if (method === 'GET') {
      throw 'bad route'
    } else if (method === 'PUT') {
      throw 'bad route'
    } else {
      throw `Cannot use ${method} method for this route`
    }
  } catch (err) {
    // console.log('type', typeof err)
    console.log('raw', err)
    if (typeof err === 'string') {
      res.status(400).json({ msg: 'session: ' + err })
    } else {
      res.status(500).json({ msg: 'session: ' + (err.message || err)})
    }
  }
})


function validate(source, cart) {
  const validatedItems = []

  if (!cart) throw 'No products in cart'

  for (const id in cart) {
    const item = source.find(product => product._id === id)
    // console.log('match', item, '@', id)

    // verify that all ids exist in source
    if (!item) throw `No product in source with id "${id}"`

    // verify that the local has the correct price
    if (cart[id].price !== item.price) throw 'Price discrepency'

    // verify that the local does not go over store duplicate limit
    if (cart[id].quantity > MAX_DUP_ITEMS) throw 'Exceeding max per customer limit'
    
    // verify that the local does not go over store supply
    if (cart[id].quantity > item.quantity) throw 'Exceeding supply limit'
    
    // don't allow empty quantity
    if (cart[id].quantity === 0) throw 'Empty quantity'
  

    if (!item.images[0]) throw 'Improper market image'

    // TODO: validate currency
    // if (!item.currency) throw 'Improper market currency'

    const line = {
      quantity: cart[id].quantity,
      price_data: {
        currency: item.currency || 'USD', // TODO: WARNING default should come from MONGO
        unit_amount: item.price,
        product_data: {
          name: item.name,
          description: item.description,
          images: [item.images[0]]
        }
      }
    }
    validatedItems.push(line)
  }
  return validatedItems
}