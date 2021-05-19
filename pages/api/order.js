import applyMiddleware from '../../util'
import { getSession } from 'coda-auth/client'
import { Order } from '../../models'

export default applyMiddleware(async (req, res) => {
  try {
    const session = await getSession({ req })
    if (!session) throw 'Unauthorized'
    const { method, body, query } = req
    if (method === 'POST') {
      throw 'bad route'
    } else if (method === 'GET') {
      const order = await Order.findById(query.id)
      res.status(200).json(order)
    } else if (method === 'PUT') {
      throw 'bad route'
    } else {
      throw `Cannot use ${method} method for this route`
    }
  } catch (err) {
    console.log(err)
    if (typeof err === 'string') {
      res.status(400).json({ msg: '/order: ' + err })
    } else {
      res.status(500).json({ msg: '/order: ' + (err.message || err)})
    }
  }
})