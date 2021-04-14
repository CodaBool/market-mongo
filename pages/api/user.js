import { idFromReqOrCtx } from '../../util'
import dbConnect from '../../util/db'
import { User } from '../../models'

export default async (req, res) => {
  try {
    let response = null
    let error = null
    switch (req.method) {
      case 'POST':
        await postUser(req.body)
          .then(r => {
            if (r.name === 'MongoError' && r.code === 11000) {
              error = 'User already exists'
            } else {
              response = r
            }
          })
          .catch(err => error = err)
        break
      case 'GET':
        await getUser(req.query.email)
          .then(r => {
            if (r) {
              response = r
            } else { // null when nothing found
              error = 'User not found'
            }
          })
          .catch(err => error = err)
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
      default:
        throw `Cannot use method ${req.method} for this route`
    }
    if (response) {
      res.status(200).json(response)
    } else if (error) {
      res.status(400).json(error)
    } else {
      throw 'No response'
    }
  } catch (err) {
    res.status(500).send(err.message)
  }
}

// Seperated to allow for use in pages with getServerSideProps and in next-auth
export async function getUser(email) { // always place in try catch, returns null when no user is found
  await dbConnect()
  return User.findOne({ email }).then(res => res).catch(err => err)
}

export async function getUserFromContext(context) { // always place in try catch, returns null when no user is found
  await dbConnect()
  return User.findById(idFromReqOrCtx(null, context)).then(res => res).catch(err => err)
}

export async function postUser(data) { // always place in try catch
  await dbConnect()
  return User.create(data).then(res => res).catch(err => err)
}

export async function putUser(email, data) { // always place in try catch
  await dbConnect()
  // new: true => returns the updated document
  return User.findOneAndUpdate({ email }, data, { new: true }).then(res => res).catch(err => err)
}