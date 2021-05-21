const stripe = require('stripe')(process.env.STRIPE_SK, { apiVersion: '2020-08-27' })
import { buffer } from "micro"
import Cors from 'micro-cors'

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
    console.log('wh secret', process.env.STRIPE_WH, headers['stripe-signature'])
    const buf = await buffer(req)
    const event = stripe.webhooks.constructEvent(
      buf.toString(),
      headers['stripe-signature'],
      process.env.STRIPE_WH
    )
    console.log('✅', event)
    res.status(200).json({msg: 'hi'})
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: err.message || err})
  }
})