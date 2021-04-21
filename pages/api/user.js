import applyMiddleware, { jwtFromReqOrCtx } from '../../util'
import { User } from '../../models'

export default applyMiddleware(async (req, res) => {
  try {
    let response = null
    let error = null
    switch (req.method) {
      case 'POST':
        const valid = await verify(req.body.token)
        if (valid) {
          console.log('inserting user', {email: req.body.email, password: req.body.password})
          // TODO: create stripe customer first and append customer id
          await postUser({email: req.body.email, password: req.body.password})
            .then(r => {
              if (r.name === 'MongoError' && r.code === 11000) {
                error = 'User already exists'
              } else {
                response = r
              }
            })
            .catch(err => error = err)
        }
        break
      case 'GET':
        console.log('query', req.query)
        if (!req.query.email) throw 'No user provided'
        await getUser(req.query.email)
          .then(r => {
            console.log('GET /user RAW Mongo Response', r)
            if (r) {
              response = r
            } else { // null when nothing found
              error = 'User not found'
            }
          })
          .catch(err => {console.log(err); error = err})
        break
      case 'PUT':
        if (req.body.data.admin) { // admin is immutable
          error = 'Permission denied'
        } else {
          await putUser(req.body.email, req.body.data)
            .then(r => {
              console.log('you did a PUT')
              if (r) {
                response = r
              } else { // null when no dif or could not find user
                error = 'User could not be found / No difference found'
              }
            })
            .catch(err => error = err)
        }
        break
      default: // 405
        console.log('ERROR: wrong method')
        throw `Cannot use method ${req.method} for this route`
    }
    if (response) {
      res.status(200).json(response)
    } else if (error) {
      console.log('ERROR: custom error', error)
      res.status(400).json({ msg: error })
    } else {
      throw 'No response'
    }
  } catch (err) {
    console.log('ERROR: catch', '/user: ' + (err.message || err))
    res.status(500).json({msg: '/user: ' + (err.message || err)})
  }
})

async function verify(token) {
  let valid = false
  await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SK}&response=${token}`, {method: 'POST'})
    .then(res => res.json())
    .then(data => valid = data.success === true)
  console.log(valid)
  return valid
}

// Seperated to allow for use in pages with getServerSideProps and in next-auth
// WARNING: always place in try catch, returns null when no user is found
// WARNING: does not wait for db connection! Intentional due to the use of 2 methods for connecting to db
// - METHOD 1: applyMiddleware, bakes in the wait for connection, typically used in /api routes
// - METHOD 2: await connectDB, waits for connection, typically used in getServerSideProps
//   - NOTE: wrap result in jparse() if sending to client to properly serialize json, see example below

export async function getUser(email) { // always place in try catch
  return User.findOne({ email })
}

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