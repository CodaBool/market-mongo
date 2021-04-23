import { jwtFromReqOrCtx } from '../../util'
import { connectDB } from '../../util/db'
import { User } from '../../models'

const stripe = require('stripe')(process.env.STRIPE_SK)

export default async (req, res) => {
  try {
    const { method, body, query } = req
    if (method === 'POST') {
      const valid = await verify(body.token)
      if (!valid) throw 'Invalid Captcha'

      // STRIPE
      const result = await stripe.customers.list({ email: body.email.toLowerCase() })
      if (result.data.length) throw 'Email Taken'
      const customer = await stripe.customers.create({ email: body.email.toLowerCase() })
        .catch(err => { throw err.raw.message })

      // MONGO
      await connectDB()
      const user = await User.create({
        email: body.email,
        password: body.password,
        customerId: customer.id
      }).then(resp => {
          if (resp.code === 11000) throw 'User already exists'
        })
        .catch(err => { throw err._message})

      if (user && customer) {
        res.status(200).send('Successful Signup!')
        return
      } else throw 'Could not signup'
      
    } else if (method === 'GET') {
      const customer = await getCustomer(query.id, query.email)
      res.status(200).json(customer)
      return
    } else if (method === 'PUT') {
      let insert = {}
      if (false) { // Admin
        insert = body.data
      } else {
        insert = { shipping: body.shipping }
      }
      const customer = await stripe.customers.update(body.id, insert)
        .catch(err => { throw err.raw.message })
      res.status(200).json(customer)
      return
    } else {
      throw `Cannot use ${method} method for this route`
    }
  } catch (err) {
    if (typeof err === 'string') {
      res.status(400).json({ msg: '/customer: ' + err })
    } else {
      res.status(500).json({ msg: '/customer: ' + (err.message || err)})
    }
  }
}

async function verify(token) {
  let valid = false
  await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SK}&response=${token}`, {method: 'POST'})
    .then(res => res.json())
    .then(data => valid = data.success === true)
  return valid
}


async function getCustomer(id, email) {
  if (!id && !email) throw 'Missing ID or Email'
  if (id) {
    const customer = await stripe.customers.retrieve(id)
      .catch(err => { throw err.raw.message })
    return customer
  }
  const result = await stripe.customers.list({ limit: 1, email: email.toLowerCase() })
  if (result.has_more) { // duplicates
    throw 'Duplicate emails'
  } else if (result.data.length) { // found one
    return result.data[0]
  } else { // found none
    return result.data
  }
}