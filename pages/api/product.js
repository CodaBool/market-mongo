import { getSession } from 'coda-auth/client'
import applyMiddleware from '../../util'
import { Product } from '../../models'

export default applyMiddleware(async (req, res) => {
  try {
    const session = await getSession({ req })
    const { method, body, query } = req
    if (method === 'GET') { // null if user not found
      if (!session) throw 'Unauthorized'
      if (!query._id) throw 'No product ID provided'
      const product = await Product.findOne({ _id: query._id })
      res.status(200).json(product)
    } else {
      throw `Cannot use ${method} method for this route`
    }
  } catch (err) {
    console.log(err)
    if (typeof err === 'string') {
      res.status(400).json({ msg: '/product: ' + err })
    } else {
      res.status(500).json({ msg: '/product: ' + (err.message || err)})
    }
  }
})