import applyMiddleware from '../../util'
import { connectDB, jparse } from '../../util/db'
import { getSession } from 'coda-auth/client'
import { User } from '../../models'
// import { getOrderShipping } from './paypal/order'

export default applyMiddleware(async (req, res) => {
  try {
    // const session = await getSession({ req })
    // if (!session) throw 'Unauthorized'
    const { method, body, query } = req
    if (method === 'POST') {
      // throw 'bad route'
      // const valid = await verify(body.token)
      // if (valid) {
      //   await postUser({email: body.email, password: body.password})
      //     .then(r => {
      //       if (r.name === 'MongoError' && r.code === 11000) {
      //         error = 'User already exists'
      //       } else {
      //         response = r
      //       }
      //     })
      //     .catch(err => error = err)
      // }
      const session = await getSession({ req })
      console.log('session', session)
      const valid = await verify(body.token)
      console.log('got request with captcha', valid, 'and body', body)
      if (!valid) throw 'Bad Captcha'
      // console.log('post with', body)
      if (!body.email || !body.id) throw 'Missing data'
      const newUser = await User.create({ email: body.email, provider: body.id, passwordless: true })
      if (!newUser) throw 'Cannot create'
      res.status(200).json({created: true})
    } else if (method === 'GET') { // null if user not found
      const session = await getSession({ req })
      const user = await User.findOne({ email: query.email })
      if (!user) {
        res.status(200).json({ exists: false })
      } else if (session) {
        res.status(200).json(user)
      } else {
        res.status(200).json({ exists: true })
      }
    } else if (method === 'PUT') {
      console.log('data', body)
      // const orderShipping = await getOrderShipping(body.orderID).catch(console.log)
      // console.log('orderShipping', orderShipping)
      // const putData = {
      //   address: {
      //     name: '',
      //     line1: '',
      //     line2: '',
      //     postalCode: 12345,
      //     city: '',
      //     country: '',
      //     state: 'FL',
      //     phone: ''
      //   }
      // }
      // const user = await User.findOneAndUpdate(session.id, data, { new: true })
      // res.status(200).json(user)
      res.status(200).json({msg: 'hi'})
      // if (body.data.admin) { // admin is immutable
      //   error = 'Permission denied'
      // } else {
      //   await putUser(body.email, body.data)
      //     .then(r => {
      //       console.log('you did a PUT')
      //       if (r) {
      //         response = r
      //       } else { // null when no dif or could not find user
      //         error = 'User could not be found / No difference found'
      //       }
      //     })
      //     .catch(err => error = err)
      // }
    } else {
      throw `Cannot use ${method} method for this route`
    }
  } catch (err) {
    if (typeof err === 'string') {
      res.status(400).json({ msg: '/user: ' + err })
    } else {
      res.status(500).json({ msg: '/user: ' + (err.message || err)})
    }
  }
})

async function verify(token) {
  let valid = false
  await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SK}&response=${token}`, {method: 'POST'})
    .then(res => res.json())
    .then(data => valid = data.success === true)
  return valid
}

// Seperated to allow for use in pages with getServerSideProps and in next-auth
// WARNING: always place in try catch, returns null when no user is found
// WARNING: does not wait for db connection! Intentional due to the use of 2 methods for connecting to db
// - METHOD 1: applyMiddleware, bakes in the wait for connection, typically used in /api routes
// - METHOD 2: await connectDB, waits for connection, typically used in getServerSideProps
//   - NOTE: wrap result in jparse() if sending to client to properly serialize json, see example below

export async function getAuthenticatedUser(contextOrReq) {
  try {
    await connectDB()
    let session = null
    if (contextOrReq.req) { // Nextjs context
      session = await getSession(contextOrReq)
    } else { // typical req object
      session = await getSession({req: contextOrReq})
    }
    console.log('in get auth user, session =', session)
    if (!session) return Promise.reject('/user: No Session')
    let user = null
    if (session.id) {
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

export async function postUser(data) { // always place in try catch
  return User.create(data)
}

export async function putUser(email, data) { // always place in try catch
  // new: true => returns the updated document
  return User.findOneAndUpdate({ email }, data, { new: true })
}

// EXAMPLE: getServerSideProps
// export async function getServerSideProps(context) {
//   await connectDB()
//   const user = await getUserFromContext(context).catch(console.log)
//   return {
//     props: { user: jparse(user) }
//   }
// }

// EXAMPLE: front end
// axios.put('/api/user', { email: selector, data: {email: newData, active}})
//   .then(res => console.log('put res', res))
//   .catch(err => console.error('put err', err.response.data.msg))