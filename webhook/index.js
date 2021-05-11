require('dotenv').config()
const express = require("express")
const stripe = require('stripe')(process.env.STRIPE_SK, {  apiVersion: "2020-08-27" })
const app = express()

app.post('/', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    const { method, body, query, headers } = req

    console.log('origin', req.get('host'))
    console.log('ip', req.socket.remoteAddress)
    // let type = null, data = null, event = null
    const event = stripe.webhooks.constructEvent(
      body,
      headers['stripe-signature'],
      process.env.STRIPE_WH
    )
    const { type } = event 
    console.log('✅ Success:', event.id, '| Type:', event.type)
    console.log('\n=============================\n')

    if (type === 'payment_intent.succeeded') {
      console.log('payment_intent.succeeded =', event)
    } else if (type === 'payment_method.attached') {
      console.log('payment_method.attached =', event)
    } else if (type === 'payment_intent.created') {
      console.log('payment_intent.created =', event)
    } else if (type === 'charge.succeeded') {
      console.log('charge.succeeded =', event)
    } else if (type === 'checkout.session.completed') {
      console.log('checkout.session.completed =', event)
    } else {
      console.log(type, event)
    }

    console.log('\n=============================')

    res.status(200).json({msg: 'hi'})
  } catch (err) {
    if (typeof err === 'string') {
      res.status(400).json({ msg: 'webhook ❌ ' + err })
    } else {
      res.status(500).json({ msg: 'webhook ❌ ' + (err.message || err)})
    }
  }
})

app.listen(3001, () =>
  console.log(`---> http://localhost:${3001}`)
)

module.exports = app