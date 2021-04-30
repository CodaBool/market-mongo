import { getSession } from 'coda-auth/client'
const stripe = require('stripe')(process.env.STRIPE_SK)

export default async (req, res) => {
  try {
    const { method, body, query } = req
    if (method === 'POST') {
      // authenticate
      const session = await getSession({ req })
      if (!session) throw 'Unauthorized'
      const user = await User.findById(session.id)
      if (!user.admin) throw 'Unauthorized'

      const result = await stripe.customers.list({ email: body.email.toLowerCase() })
      if (result.data.length) throw 'Email Taken'
      const customer = await stripe.customers.create({ email: body.email.toLowerCase() })
        .catch(err => { throw err.raw.message })
      res.status(200).send('Successful Signup!')
      
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
      // authenticate
      const session = await getSession({ req })
      if (!session) throw 'Unauthorized'
      const user = await User.findById(session.id)
      if (!user.admin) throw 'Unauthorized'

      const product = await stripe.products.update(body.id, body.product)
        .catch(err => console.log(err))
      console.log(product)
      // const customer = await stripe.customers.update(body.id, insert)
      //   .catch(err => { throw err.raw.message })
      res.status(200).json({msg: 'hi'})

    } else {
      throw `Cannot use ${method} method for this route`
    }
  } catch (err) {
    if (typeof err === 'string') {
      res.status(400).json({ msg: '/admin/product: ' + err })
    } else {
      res.status(500).json({ msg: '/admin/product: ' + (err.message || err)})
    }
  }
}