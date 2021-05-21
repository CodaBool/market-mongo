const stripe = require('stripe')(process.env.STRIPE_SK, { apiVersion: '2020-08-27' })
import { buffer } from "micro"
import Cors from 'micro-cors'
import { extractRelevantData, webhookOrderValidation } from "../../../constants"
import { Order, Product, User } from '../../../models'
import { connectDB, castToObjectId } from '../../../util/db'

const cors = Cors({
  allowMethods: ['POST', 'HEAD'],
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default cors(async (req, res) => {
  try {
    const { method, body, headers } = req
    const buf = await buffer(req)
    // Authorize
    if (process.env.NODE_ENV === 'production') {
      console.log('host', headers.host)
      console.log('ip', headers['x-forwarded-for'])
      console.log('allowed ips', process.env.STRIPE_WH_ALLOW_LIST)
      let allowedIPs
      if (process.env.STRIPE_WH_ALLOW_LIST) {
        allowedIPs = process.env.STRIPE_WH_ALLOW_LIST.split(',')
      }
      console.log('allow list split', allowedIPs)
      if (allowedIPs) {
        if (!allowedIPs.includes(headers['x-forwarded-for'])) throw `Unauthorized IP ${headers['x-forwarded-for']}`
      }
      if (headers.host) {
        // dev host is = market-mongo-dev.s3.us-east-1.amazonaws.com
        console.log('slice result =', headers.host.slice(-13))
        console.log('slice exact compare result =', headers.host.slice(-13) !== 'codattest.com')
        console.log('simplier includes result = ', headers.host.includes('codattest.com'))
        console.log('find one to test header host with')
        // if (!headers.host.slice(-13) === 'codattest.com') throw `Unauthorized origin ${req.get('host')}`
      }
    }

    // Construct
    const event = stripe.webhooks.constructEvent(
      buf.toString(),
      headers['stripe-signature'],
      process.env.STRIPE_WH
    )
    const { type } = event 
    console.log('✅', event.type)

    if (type === 'payment_intent.succeeded') {

      // TODO:
      const { object: intent } = event.data
      let user = null
      if (process.env.NODE_ENV !== 'production') {
        user = { _id: '6091e915a717e41c88a8d612'}
        // console.log('local environment detected, using placeholder user')
      } else {
        console.log('cus_id =', intent.customer, '| email =', intent.charges.data[0].billing_details.email)
        user = await User.findOne({ customerId: intent.customer }).catch(console.log)
        console.log('found user with id =', user._id)
      }
      
      if (!user) throw 'Could not associate intent with a user'

      await connectDB()
      const data = extractRelevantData(intent)
      const products = await Product.find()
      const order = await Order.findOne({ id_stripe_intent: intent.id })
      const valid = webhookOrderValidation(products, order.items, data)
      console.log('valid check ----->\n' + JSON.stringify(valid, null, 4))
      const updatedOrder = await Order.findOneAndUpdate({ id_stripe_intent: intent.id }, {valid}, {new: true})

    } else if (type === 'payment_method.attached') {
      // console.log('payment_method.attached =', event)
    } else if (type === 'payment_intent.created') {
      // console.log('payment_intent.created =', event)
    } else if (type === 'charge.succeeded') {
    } else if (type === 'checkout.session.created') {
      console.log('session created metadata =', event.data.object.metadata)
    } else if (type === 'charge.succeeded') {
      // console.log('charge.succeeded =')
      // console.log(JSON.stringify(event, null, 4))
    } else if (type === 'checkout.session.completed') {
      // console.log('checkout.session.completed =')
      // console.log(JSON.stringify(event, null, 4))
      console.log('session completed metadata =', event.data.object.metadata)

      // TRUE! metadata passed from create to complete

    } else if (type === 'customer.updated') {
      console.log('customer email updated, bad stripe!')
      // revert email back to original
      const { metadata, email, id } = event.data.object
      if (!metadata.signupEmail || !email || !id) throw `Missing data | signupEmail=${metadata.signupEmail}, email=${email}, id=${id}`
      console.log('is match?', metadata.signupEmail, '===', email)
      if (metadata.signupEmail !== email) {
        console.log('reverting customer', id, 'from', email, '=>', metadata.signupEmail)
        const customer = await stripe.customers.update(id, { email: metadata.signupEmail })
          .catch(err => { console.log(err); throw err.raw.message })
        console.log('fixed customer =', customer)
      }
    } else {
      // console.log(type, event)
    }

    res.status(200).json({msg: 'hi'})
  } catch (err) {
    console.error(err)
    if (typeof err === 'string') {
      res.status(400).json({ msg: 'webhook ❌ ' + err })
    } else {
      res.status(500).json({ msg: 'webhook ❌ ' + (err.message || err)})
    }
  }
})