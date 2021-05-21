import paypal from '@paypal/checkout-server-sdk'
import { connectDB, castToObjectId } from '../../../util/db'
import { Order, User } from '../../../models'

export default async (req, res) => {
  try {
    console.log('\n=======================')
    // console.log(process.env.NODE_ENV, 'enviroment')
    const { method, body, headers, socket } = req

    // Authorize
    if (method !== 'POST') throw 'Bad Request'
    if (process.env.NODE_ENV === 'production') {
      console.log('DEBUG paypal webhook, trying to read socket', socket)
      // console.log('prod env', process.env.ALLOW_LIST, socket.remoteAddress, headers.host)
      // const allowedIPs = process.env.ALLOW_LIST.split(',')
      // if (!allowedIPs.includes(socket.remoteAddress)) throw `Unauthorized IP ${socket.remoteAddress}`
      // if (!headers.host.slice(-13) === 'codattest.com') throw `Unauthorized origin ${req.get('host')}`

      // is this even a thing?
      // const liveEnv = new paypal.core.LiveEnviroment(process.env.NEXT_PUBLIC_PAYPAL_ID, process.env.PAYPAL_SK)

      const env = new paypal.core.SandboxEnvironment(process.env.NEXT_PUBLIC_PAYPAL_ID, process.env.PAYPAL_SK)
      const paypalAPI = new paypal.core.PayPalHttpClient(env)
  
      // Verification
      // DOCS --> https://developer.paypal.com/docs/api-basics/notifications/webhooks/rest/#verify-event-notifications
      // mock events cannot be verified
      // EXAMPLE --> https://github.com/medusajs/medusa/blob/21eebd36787f39aaf9b85d9e1d36732640127351/packages/medusa-payment-paypal/src/services/paypal-provider.js
      // used code from medusajs/medusa as template
      const response = await paypalAPI.execute({
        verb: "POST",
        path: "/v1/notifications/verify-webhook-signature",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          webhook_id: process.env.PAYPAL_WH,
          auth_algo: headers['paypal-auth-algo'],
          cert_url: headers['paypal-cert-url'],
          transmission_id: headers['paypal-transmission-id'],
          transmission_sig: headers['paypal-transmission-sig'],
          transmission_time: headers['paypal-transmission-time'],
          webhook_event: body
        },
      })

      console.log('verified =', response.result.verification_status) // SUCCESS || FAILURE
      console.log('ip', socket.remoteAddress)
      console.log('host', headers.host)
      console.log('headers', headers)

      // TODO: throw if response.result.verification_status === 'FAILURE' unathorized
    }

    // TODO: development placeholder verification
    console.log('--->', body.event_type)
    if (!headers['paypal-transmission-sig']) console.log('req missing signature')
    // console.log(JSON.stringify(body, null, 4))

    // CHECKOUT.ORDER.COMPLETED

    // PAYMENT.CAPTURE.COMPLETED

    // 1st CHECKOUT.ORDER.APPROVED
    // 2nd PAYMENT.CAPTURE.COMPLETED

    if (body.event_type === 'CHECKOUT.ORDER.APPROVED') {
      console.log(JSON.stringify(body, null, 4))
      const env = new paypal.core.SandboxEnvironment(process.env.NEXT_PUBLIC_PAYPAL_ID, process.env.PAYPAL_SK)
      const paypalAPI = new paypal.core.PayPalHttpClient(env)
  
      // Verification
      // DOCS --> https://developer.paypal.com/docs/api-basics/notifications/webhooks/rest/#verify-event-notifications
      // mock events cannot be verified
      // EXAMPLE --> https://github.com/medusajs/medusa/blob/21eebd36787f39aaf9b85d9e1d36732640127351/packages/medusa-payment-paypal/src/services/paypal-provider.js
      // used code from medusajs/medusa as template
      const response = await paypalAPI.execute({
        verb: "POST",
        path: "/v1/notifications/verify-webhook-signature",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          webhook_id: process.env.PAYPAL_WH,
          auth_algo: headers['paypal-auth-algo'],
          cert_url: headers['paypal-cert-url'],
          transmission_id: headers['paypal-transmission-id'],
          transmission_sig: headers['paypal-transmission-sig'],
          transmission_time: headers['paypal-transmission-time'],
          webhook_event: body
        },
      })
  
      console.log('verified =', response.result.verification_status) // SUCCESS || FAILURE
      // console.log('ip', socket.remoteAddress)
      // console.log('host', headers.host)
      // console.log('headers', headers)

      const main = {
        order_id: body.resource.id,
        vendor: 'paypal',
        status: body.resource.status,
        payer: body.resource.payer,
        capture_id: body.resource.purchase_units[0].payments.captures[0].id,
        amount: body.resource.purchase_units[0].amount.value,
        currency: body.resource.purchase_units[0].amount.currency_code,
        shipping: body.resource.purchase_units[0].shipping,
        capture_status: body.resource.purchase_units[0].payments.captures[0].status,
        capture_created: body.resource.purchase_units[0].payments.captures[0].create_time,
      }

      // console.log('main before connect', main)
      await connectDB()
      const order = await Order.findById(body.resource.id)
      console.log('compare', main, 'vs', order)
    }



    // if (type === 'payment_intent.succeeded') {
    //   console.log(JSON.stringify(event, null, 4))
      // console.log('\n=====================')
      // let user = null
      // if (process.env.NODE_ENV !== 'production') {
      //   user = { _id: '6091e915a717e41c88a8d612'}
      //   console.log('local environment detected, using placeholder user')
      // } else {
      //   console.log('cus_id =', o.customer, '| email =', o.charges.data[0].billing_details.email)
      //   user = await User.findOne({ customerId: o.customer }).catch(console.log)
      //   console.log('found user with id =', user._id)
      // }

      // if (!user) throw 'Could not associate intent with a user'

      // const orderData = {
      //   _id: o.id,
      //   user: user._id,
      //   vendor: 'Stripe',
      //   id_customer: o.customer,
      //   id_payment_method: o.payment_method,
      //   payment_status: o.payment_status,
      //   metadata: o.metadata,
      //   amount_intent: o.amount,
      //   amount_capturable: o.amount_capturable,
      //   amount_received: o.amount_received,
      //   client_secret: o.client_secret,
      //   created: o.created,
      //   currency: o.currency,
      //   livemode: o.livemode,
      //   status: o.status,
      //   shipping: o.shipping,
      //   charges
      // }
      // console.log('----->', orderData)
      // await connectDB()
      // const order = await Order.create(orderData).catch(console.log)
      // console.log('made order', order)
      // console.log('=====================')
    // } else if (type === 'payment_method.attached') {
    // } else {
      // console.log(type, event)
    // }
    console.log('=======================\n')
    res.status(200).json({msg: 'hi'})
  } catch (err) {
    console.error(err)
    if (typeof err === 'string') {
      res.status(400).json({ msg: 'paypal/webhook ❌ ' + err })
    } else {
      res.status(500).json({ msg: 'paypal/webhook ❌ ' + (err.message || err)})
    }
  }
}