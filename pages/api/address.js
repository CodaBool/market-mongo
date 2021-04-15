import applyMiddleware from '../../util'
import { User } from '../../models'

export default applyMiddleware(async (req, res) => {
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
            } else {
              error = 'User not found'
            }
          })
          .catch(err => error = err)
        break
      case 'PUT':
        console.log('you did a PUT')
        break
      case 'DELETE':
        console.log('you did a DELETE')
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
    res.status(500).send(err)
  }
})

// Seperated to allow for use in pages with getServerSideProps and in next-auth
export async function getUser(email) { // always place in try catch, returns null when no user is found
  return User.findOne({ email }).then(res => res).catch(err => err)
}

export async function postUser(data) { // always place in try catch
  return User.create(data).then(res => res).catch(err => err)
}