// import { jwtFromReqOrCtx } from '../../util'
import { connectDB } from '../../util/db'
import { getSession } from 'coda-auth/client'
import { User } from '../../models'

const stripe = require('stripe')(process.env.STRIPE_SK)

export default async (req, res) => {
  try {
    const { method, body, query } = req
    if (method === 'POST') {
      const valid = await verify(body.token)
      if (!valid) throw 'Invalid Captcha'

      // reverting back to mongo user creation only

      // STRIPE
      // const email = body.email.toLowerCase().trim()
      // const result = await stripe.customers.list({ email })
      // if (result.data.length > 0) throw 'Email Taken'
      // const customer = await stripe.customers.create({ 
      //   email,
      //   metadata: { signupEmail: email }
      // })
      //   .catch(err => { throw err.raw.message })
      // if (!customer) throw 'Could not create Stripe Customer'

      // MONGO
      await connectDB()
      const user = await User.create({
        email: body.email,
        password: body.password
      }).catch(err => {
        console.log('err', err.message)
        // console.log('rolling back customer creation', customer.id)
        // stripe.customers.del(customer.id)
        if (err.code === 11000) throw 'User already exists'
        if (err.message.includes('timed out')) throw 'Server Timeout'
      })
      if (user) {
        res.status(200).json({id: user._id})
      } else throw 'Could not signup'
    } else if (method === 'GET') {
      const customer = await getCustomer(query.id, query.email)
      res.status(200).json(customer)
      return
    } else if (method === 'PUT') {
      const session = await getSession({ req })
      if (!session) throw 'Unauthorized'
      // Set fields explicitly to prevent unauthorized puts
      const customer = await stripe.customers.update(session.customerId, {
        shipping: {
          name: body.name,
          address: {
            line1: body.address.line1,
            line2: body.address.line2,
            postal_code: body.address.postal_code,
            city: body.address.city,
            state: body.address.state,
            country: 'US' // https://stripe.com/docs/api/customers/object#customer_object-shipping-address-country
          }
        }
      }).catch(err => { console.log(err); throw err.raw.message })
      res.status(200).json(customer)
      return
    } else {
      throw `Cannot use ${method} method for this route`
    }
  } catch (err) {
    if (typeof err === 'string') {
      res.status(400).json({ msg: err })
    } else {
      res.status(500).json({ msg: err.message || err})
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

export async function getAuthenticatedCustomer(contextOrReq) {
  try {
    await connectDB()
    let session = null
    if (contextOrReq.req) { // Nextjs context
      session = await getSession(contextOrReq)
    } else { // typical req object
      session = await getSession({req: contextOrReq})
    }
    if (!session) return Promise.reject('/customer: No Session')
    let customer = null
    if (session.stripeId) {
      user = await User.findById(session.id)
    } else {
      user = await User.findOne({email: session.user.email})
    }
    return jparse(user)
  } catch (err) {
    console.log('/getUser: ', err.message)
    return null
  }
}

async function getCustomer(id, email) {
  if (!id && !email) throw 'Missing ID or Email'
  if (id) {
    const customer = await stripe.customers.retrieve(id)
      .catch(err => { throw err.raw.message })
      // TODO: this may be a better form .catch(err => { throw err.message })
    return customer
  }
  const result = await stripe.customers.list({ limit: 1, email: email.toLowerCase() }) // TODO: look into a catch for this
  if (result.has_more) { // duplicates
    throw 'Duplicate emails'
  } else if (result.data.length) { // found one
    return result.data[0]
  } else { // found none
    return result.data
  }
}