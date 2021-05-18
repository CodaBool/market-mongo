// import { jwtFromReqOrCtx } from '../../util'
// import { connectDB } from '../../util/db'
// import { User } from '../../models'

const stripe = require('stripe')(process.env.STRIPE_SK)

export default async (req, res) => {
  try {
    const { method, body, query } = req
    if (method === 'POST') {
      throw 'bad route'
    } else if (method === 'GET') {
      const intents = await stripe.paymentIntents.list({limit: 100, customer: query.id })
        .catch(err => { throw err.raw.message })
        // TODO: this may be a better form .catch(err => { throw err.message })
      if (intents.has_more) {
        // TODO: handle with skip
      }
      console.log(intents)
      res.status(200).json(intents.data)
    } else if (method === 'PUT') {
      // res.status(200).json(customer)
      throw 'bad route'
    } else {
      throw `Cannot use ${method} method for this route`
    }
  } catch (err) {
    if (typeof err === 'string') {
      res.status(400).json({ msg: '/intent: ' + err })
    } else {
      res.status(500).json({ msg: '/intent: ' + (err.message || err)})
    }
  }
}