require('dotenv').config()
const express = require("express")
const stripe = require('stripe')(process.env.STRIPE_SK, {  apiVersion: "2020-08-27" })
const app = express()

app.post('/', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    const { method, body, query, headers } = req

    // Allow only stripe IPs and trusted Origin
    if (process.env.NODE_ENV === 'production') {
      const allowedIPs = process.env.ALLOW_LIST.split(',')
      if (!allowedIPs.includes(req.socket.remoteAddress)) throw `Unauthorized IP ${req.socket.remoteAddress}`
      if (!req.get('host').slice(-13) === 'codattest.com') throw `Unauthorized origin ${req.get('host')}`
    }
    
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

      // revert email back to original
      console.log('is', event.data.object.metadata.signupEmail, '===', event.data.object.customer_details.email)
      if (event.data.object.metadata.signupEmail !== event.data.object.customer_details.email) {
        console.log('reverting customer', event.data.object.customer, 'to', event.data.object.customer_details.email)
        const customer = await stripe.customers.update(event.data.object.customer, { email: event.data.object.metadata.signupEmail })
          .catch(err => { console.log(err); throw err.raw.message })
        console.log('fixed customer =', customer)
      }

      console.log('checkout.session.completed =', event)
    } else {
      console.log(type, event)
    }

    // event.data.object
    // .customer (id)
    // .customer_details.email
    // .metadata.signupEmail

    console.log('\n=============================')

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

if (process.env.NODE_ENV !== 'production') {
  app.listen(3001, () =>
    console.log(`---> http://localhost:${3001}`)
  )
}

module.exports = app