const stripe = require('stripe')(process.env.STRIPE_SK, { apiVersion: '2020-08-27' })
// import express from 'express'
import { buffer } from "micro"
import { Order, User } from '../../../models'
import { connectDB, castToObjectId } from '../../../util/db'
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async (req, res) => {
  try {
    console.log('req in', process.env.NODE_ENV, 'enviroment')
    const { method, body, headers, socket } = req
    const buf = await buffer(req)

    // Authorize
    if (process.env.NODE_ENV === 'production') {
      console.log('DEBUG stripe webhook, trying to read socket', socket)
      if (!socket) console.log('issue getting socket for ip', JSON.stringify(req, null, 4))
      console.log('prod env', process.env.ALLOW_LIST, socket.remoteAddress, headers.host)
      const allowedIPs = process.env.ALLOW_LIST.split(',')
      if (!allowedIPs.includes(socket.remoteAddress)) throw `Unauthorized IP ${socket.remoteAddress}`
      if (!headers.host.slice(-13) === 'codattest.com') throw `Unauthorized origin ${req.get('host')}`
    }

    // Construct
    const event = stripe.webhooks.constructEvent(
      buf,
      headers['stripe-signature'],
      process.env.STRIPE_WH
    )
    const { type } = event 
    // console.log('\n=============================')
    console.log('✅', event.type)

    if (type === 'payment_intent.succeeded') {
      // console.log(JSON.stringify(event, null, 4))
      const { object: o } = event.data
      console.log('\n=====================')
      let user = null
      if (process.env.NODE_ENV !== 'production') {
        user = { _id: '6091e915a717e41c88a8d612'}
        console.log('local environment detected, using placeholder user')
      } else {
        console.log('cus_id =', o.customer, '| email =', o.charges.data[0].billing_details.email)
        user = await User.findOne({ customerId: o.customer }).catch(console.log)
        console.log('found user with id =', user._id)
      }
      
      if (!user) throw 'Could not associate intent with a user'

      const charges = o.charges.data.map(charge => (
        {
          _id: charge.id,
          id_customer: charge.customer,
          id_user: user._id,
          id_payment_intent: charge.payment_intent,
          id_payment_method: charge.payment_method,
          amount: charge.amount,
          amount_captured: charge.amount_captured,
          amount_refunded: charge.amount_refunded,
          captured: charge.captured,
          created: charge.created,
          currency: charge.currency,
          paid: charge.paid,
          receipt_url: charge.receipt_url,
          refunded: charge.refunded,
          status: charge.status,
          risk: charge.outcome.risk_level + '-' + charge.outcome.risk_score,
          fingerprint: charge.payment_method_details.card.fingerprint,
          card_last4: charge.payment_method_details.card.last4,
          refunds: charge.refunds.data,
        }
      ))
      const orderData = {
        _id: o.id,
        user: user._id,
        vendor: 'Stripe',
        id_customer: o.customer,
        id_payment_method: o.payment_method,
        payment_status: o.payment_status,
        metadata: o.metadata,
        amount_intent: o.amount,
        amount_capturable: o.amount_capturable,
        amount_received: o.amount_received,
        client_secret: o.client_secret,
        created: o.created,
        currency: o.currency,
        livemode: o.livemode,
        status: o.status,
        shipping: o.shipping,
        charges
      }
      console.log('----->', orderData)
      await connectDB()

      const debugOrder = await Order.findById(o.id)
      console.log('compare', orderData, 'vs', debugOrder)

      // const order = await Order.create(orderData).catch(console.log)
      // console.log('made order', order)
      console.log('=====================')
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
      // console.log('customer.updated =', event)
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
}