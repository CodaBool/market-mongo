const stripe = require('stripe')(process.env.STRIPE_SK)
import { getSession } from 'coda-auth/client'
import { Product, Order } from '../../../models'
import applyMiddleware from '../../../util'
import { createOrderValidation } from '../../../constants'

export default applyMiddleware(async (req, res) => {
  try {

    // Authenticate
    const jwt = await getSession({ req })
    if (!jwt) throw 'Unauthorized'

    const { method, body, query } = req
    if (method === 'POST') {

      const products = await Product.find()
      const { vendorLines, total, orderLines } = createOrderValidation(products, body, 'stripe')

      // TODO: allow for async calls
      const session = await stripe.checkout.sessions.create({
        success_url: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/checkout/confirmed?id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/checkout/cancelled?id={CHECKOUT_SESSION_ID}`,
        metadata: { id: jwt.id, email: jwt.user.email },
        payment_method_types: ['card'],
        customer: jwt.customerId,
        mode: 'payment',
        line_items: vendorLines,
        shipping_address_collection: {
          allowed_countries: ['US']
        },
      })
      const order = await Order.create({
        _id: session.id,
        user: jwt.id,
        email: jwt.user.email,
        id_customer: jwt.customerId,
        vendor: 'stripe',
        status: 'capture',
        amount: session.amount_total,
        id_stripe_intent: session.payment_intent,
        pay_status: session.payment_status,
        metadata: session.metadata,
        currency: session.currency,
        livemode: session.livemode,
        valid: { wh_verified: false },
        items: orderLines
      })

      console.log('STRIPE CREATE:\n_id='+ order._id, '\n' + String(orderLines.length), 'items @', session.amount_total)

      // DEBUG
      // allow_promotion_codes, total_details {}
      // console.log('STRIPE|NEWDATA=', JSON.stringify(session, null, 4))

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