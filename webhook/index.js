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
    console.log('=============================')

    if (type === 'payment_intent.succeeded') {
      // console.log('payment_intent.succeeded =')
      // console.log(JSON.stringify(event, null, 4))

      // create relevant obj
      const { object: o } = event.data
      console.log('=== loop charges ===')
      // console.log('o', o)
      const charges = o.charges.data.map((charge, index) => {
        console.log('charge', charge.refunds)
        const obj = {
          _id: charge.id,
          id_customer: charge.customer,
          id_user: null,
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
        // console.log('relevant obj =', obj)
        return obj
      })
      console.log('charges', charges)
      const main = {
        id_intent: o.id,
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
      console.log('main', main)
      console.log('=====================')
    } else if (type === 'payment_method.attached') {
      console.log('payment_method.attached =', event)
    } else if (type === 'payment_intent.created') {
      // console.log('payment_intent.created =', event)
    } else if (type === 'charge.succeeded') {
      // console.log('charge.succeeded =')
      // console.log(JSON.stringify(event, null, 4))
    } else if (type === 'checkout.session.completed') {
      console.log('checkout.session.completed =')
      console.log(JSON.stringify(event, null, 4))
    } else if (type === 'customer.updated') {
      console.log('customer.updated =', event)
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