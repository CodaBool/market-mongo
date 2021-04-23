import applyMiddleware, { jwtFromReqOrCtx } from '../../util'
import { User } from '../../models'

export default applyMiddleware(async (req, res) => {
  try {
    const { method, body, query } = req
    if (method === 'POST') {
      throw 'bad route'
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
    } else if (method === 'GET') { // null if user not found
      const user = await User.findOne({ email: query.email })
      res.status(200).json(user)
    } else if (method === 'PUT') {
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

// Seperated to allow for use in pages with getServerSideProps and in next-auth
// WARNING: always place in try catch, returns null when no user is found
// WARNING: does not wait for db connection! Intentional due to the use of 2 methods for connecting to db
// - METHOD 1: applyMiddleware, bakes in the wait for connection, typically used in /api routes
// - METHOD 2: await connectDB, waits for connection, typically used in getServerSideProps
//   - NOTE: wrap result in jparse() if sending to client to properly serialize json, see example below

export async function getUserFromContext(context) { // always place in try catch
  const jwt = jwtFromReqOrCtx(context)
  if (jwt?.id) {
    return User.findById(jwt.id)
  } else if (jwt) {
    return User.findOne({email: jwt.email})
  }
  return Promise.reject('/user: No Session ID')
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