const stripe = require('stripe')(process.env.STRIPE_SK, { apiVersion: '2020-08-27' })
import { buffer } from "micro"
import Cors from 'micro-cors'
import { extractRelevantData, itemsValidation } from "../../../constants"
import { Order, Product } from '../../../models'
import { connectDB } from '../../../util/db'

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
    if (!process.env.STRIPE_WH) throw 'no sign secret provided'
    const event = stripe.webhooks.constructEvent(
      buf.toString(),
      headers['stripe-signature'],
      process.env.STRIPE_WH
    )
    const { type } = event 
    console.log('✅', event.type)

    const test = (event.id === 'evt_00000000000000' || event.data.object.description === '(created by Stripe CLI)')

    if (type === 'payment_intent.succeeded') {

      const { object: intent } = event.data
      let order = null

      await connectDB()

      // console.log('intent ----->\n' + JSON.stringify(intent, null, 4))
      const data = extractRelevantData(intent)

      if (process.env.NODE_ENV !== 'production' || test) {
        order = {
          "_id": "cs_test_a1snMJ8zjh1VwBTAN7sHeONoXcMIGTRsTE8rmZN99DsAbR8nFkTIzEmy2C",
          "amount_received": 0,
          "user": "60b879e9807edb000861d419",
          "email": "some@email.com",
          "amount": 100,
          "id_stripe_intent": "pi_1IyAO8AJvGrE9xG5M07QvpHg",
          "currency": "usd",
          "valid": { "wh_verified": false },
          "items": [
            {
              "id_prod": "prod_JQmgyaOTJlD1VG",
              "name": "thing",
              "currency": "USD",
              "quantity": 1,
              "value": 100
            }
          ],
        }
      } else {
        console.log('cus_id =', intent.customer, '| email =', intent.charges.data[0].billing_details.email)
        order = await Order.findOne({ id_stripe_intent: intent.id })
      }

      if (!order) throw 'Could not associate intent with an order'
      
      const products = await Product.find()
      const valid = itemsValidation(products, order.items, data.amount_received)
      // console.log('valid check ----->\n' + JSON.stringify(valid, null, 4))
      await Order.findOneAndUpdate({ id_stripe_intent: intent.id }, { status: 'complete', valid, ...data })

    } else if (type === 'payment_method.attached') {
    } else if (type === 'payment_intent.created') {
    } else if (type === 'charge.succeeded') {
    } else if (type === 'checkout.session.created') {
    } else if (type === 'charge.succeeded') {
    } else if (type === 'checkout.session.completed') {
    } else if (type === 'customer.updated') {
      // revert email back to original
      const { metadata, email, id } = event.data.object
      if (!metadata.signupEmail || !email || !id) throw `Missing data | signupEmail=${metadata.signupEmail}, email=${email}, id=${id}`
      console.log('is match?', metadata.signupEmail, '===', email)
      if (metadata.signupEmail !== email) {
        console.log('customer email updated, bad stripe!')
        console.log('reverting customer', id, 'from', email, '=>', metadata.signupEmail)
        const customer = await stripe.customers.update(id, { email: metadata.signupEmail })
          .catch(err => { console.log(err); throw err.raw.message })
        console.log('fixed customer =', customer.id)
      }
    }

    res.status(200).json({msg: 'no runtime errors'})
  } catch (err) {
    console.error(err)
    if (typeof err === 'string') {
      res.status(400).json({ msg: 'webhook ❌ ' + err })
    } else {
      res.status(500).json({ msg: 'webhook ❌ ' + (err.message || err)})
    }
  }
})