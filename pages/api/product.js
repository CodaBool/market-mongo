import applyMiddleware from '../../util'
import { getSession } from 'coda-auth/client'
import { Product } from '../../models'

export default applyMiddleware(async (req, res) => {
  try {
    const session = await getSession({ req })
    if (!session || session.user.email !== 'codabool@pm.me') throw 'Unauthorized'
    const { method, body, query } = req
    if (method === 'POST') {
      const product = await Product.create(body)
      console.log(product)
      res.status(200).json(product)
    } else if (method === 'GET') { // null if user not found
      if (query._id) { // one
        const product = await Product.findOne({_id: query._id})
        res.status(200).json(product)
      } else { // many
        const products = await Product.find()
        res.status(200).json(products)
      }
    } else if (method === 'PUT') {
      console.log('got', body)
      const product = await Product.findOneAndUpdate({ _id: body._id }, body.data, { new: true })
      console.log(product)
      // const product = {msg: 'ok'}
      res.status(200).json(product)
    } else if (method === 'DELETE') {
      throw 'not built yet'
    }else {
      throw `Cannot use ${method} method for this route`
    }
  } catch (err) {
    if (typeof err === 'string') {
      res.status(400).json({ msg: '/product: ' + err })
    } else {
      res.status(500).json({ msg: '/product: ' + (err.message || err)})
    }
  }
})