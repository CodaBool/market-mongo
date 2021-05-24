import paypal from '@paypal/checkout-server-sdk'
import { connectDB } from '../../../util/db'
import { Order, Product } from '../../../models'
import { itemsValidation, convertPayPalAmount } from '../../../constants'

export default async (req, res) => {
  try {
    console.log('\n=======================')
    const { method, body, headers, socket } = req

    // Authorize
    if (method !== 'POST') throw 'Bad Request'
    // if (process.env.NODE_ENV === 'production') {
    //   console.log('ip', headers['x-forwarded-for'])
    //   console.log('host', headers.host)
    // }

    // TODO: development placeholder verification
    console.log(body.event_type)

    console.log("ip headers['x-forwarded-for']", headers['x-forwarded-for'])
    console.log('ip socket', socket?.remoteAddress)
    console.log('host', headers.host)

    if (!headers['paypal-transmission-sig']) {
      console.log('WARNING: no signature')
      // console.log('headers -->', JSON.stringify(headers, null, 4))
    } else {
      // Verification
      // DOCS --> https://developer.paypal.com/docs/api-basics/notifications/webhooks/rest/#verify-event-notifications
      // mock events cannot be verified
      // EXAMPLE --> https://github.com/medusajs/medusa/blob/21eebd36787f39aaf9b85d9e1d36732640127351/packages/medusa-payment-paypal/src/services/paypal-provider.js
      // used code from medusajs/medusa as template
      const env = new paypal.core.SandboxEnvironment(process.env.NEXT_PUBLIC_PAYPAL_ID, process.env.PAYPAL_SK)
      const paypalAPI = new paypal.core.PayPalHttpClient(env)
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

      // TODO: throw if response.result.verification_status === 'FAILURE' unathorized
      console.log('verified =', response.result.verification_status) // SUCCESS || FAILURE
    }

    if (body.event_type === 'CHECKOUT.ORDER.APPROVED') {

      // console.log(JSON.stringify(body, null, 4))

      await connectDB()
      const products = await Product.find()
      const order = await Order.findById(body.resource.id)
      if (!order) {
        console.log('no order found with id', body.resource.id, JSON.stringify(order, null, 4))
      } else {
        const valid = itemsValidation(products, order.items, convertPayPalAmount(body.resource.purchase_units[0].amount.value))
        // console.log('valid check ----->\n' + JSON.stringify(valid, null, 4))
        const newData = { status: 'complete', valid }
        await Order.findByIdAndUpdate(body.resource.id, newData)
        console.log('updated Order')
      }
    }
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