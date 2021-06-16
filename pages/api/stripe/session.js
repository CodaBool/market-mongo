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
      // console.log('body', body)
      const { vendorLines, total, orderLines } = createOrderValidation(products, body, 'stripe')
      // console.log('output', vendorLines, total, orderLines)
      // res.status(200).json({msg: 'hi'})

      // TODO: create customer since stripe can't figure out it's shit

      // get all customers with matching email
      console.log('input --> email', jwt.user.email, '| id', jwt.id)
      const { data } = await stripe.customers.list({ email: jwt.user.email })
      const customers = data.filter(customer => customer.metadata.userId === jwt.id)
      console.log('customers with your email', data.length, ' | found matching your id', customers.length)

      if (customers.length > 1) throw 'Duplicate Stripe Customer found'

      let customerId = ''
      if (customers.length === 1) {
        customerId = customers[0].id

        console.log('found matching customer', customerId)
      }
      if (customers.length === 0) { // create new

        console.log('creating new customer since none found with id', jwt.id, ' | email', jwt.user.email)

        const customer = await stripe.customers.create({
          email: jwt.user.email,
          metadata: { signupEmail: jwt.user.email, userId: jwt.id }
        }).catch(err => { throw err.raw.message })
        if (!customer) console.log('issue creating stripe customer')
        customerId = customer.id

        console.log('created customer', customer.id)

      }

      // TODO: allow for async calls
      const session = await stripe.checkout.sessions.create({
        success_url: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/checkout/confirmed?id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/checkout/cancelled?id={CHECKOUT_SESSION_ID}`,
        metadata: { userId: jwt.id, email: jwt.user.email, customerId  },
        payment_method_types: ['card'],
        customer: customerId,
        // customer_email: jwt.user.email,
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
        // id_customer: jwt.customerId,
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
    console.log('session', err)
    if (typeof err === 'string') {
      res.status(400).json({ msg: 'session: ' + err })
    } else {
      res.status(500).json({ msg: 'session: ' + (err.message || err)})
    }
  }
})