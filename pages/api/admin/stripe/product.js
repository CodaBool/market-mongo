import { getSession } from 'coda-auth/client'
import applyMiddleware from '../../../../util'
import { User } from '../../../../models'
const stripe = require('stripe')(process.env.STRIPE_SK)

export default applyMiddleware(async (req, res) => {
  try {
    const session = await getSession({ req })
    const user = await User.findById(session.id)
    if (!user.admin) throw 'Unauthorized'
    const { method, body, query } = req
    if (method === 'POST') {
      const product = await stripe.products.create(body)
      res.status(200).json(product)
    } else if (method === 'GET') {
      let products = null
      if (query.id) { // single
        products = await stripe.products.retrieve(query.id)
          .catch(err => { throw err.message })
      } else if (query.active) { // many
        products = await stripe.products.list({limit: 100, active: query.active})
          .then(res => res.data)
          .catch(err => { throw err.message })
      }
      res.status(200).json(products)
    } else if (method === 'PUT') {
      const product = await stripe.products.update(body.id, body.product)
      res.status(200).json(product)
    } else {
      throw `Cannot use ${method} method for this route`
    }
  } catch (err) {
    console.log('stripe', err)
    if (typeof err === 'string') {
      res.status(400).json({ msg: '/admin/stripe/product: ' + err })
    } else {
      res.status(500).json({ msg: '/admin/stripe/product: ' + (err.message || err)})
    }
  }
})