import { getSession } from 'coda-auth/client'
import applyMiddleware from '../../../../util'
import { User } from '../../../../models'

export default applyMiddleware(async (req, res) => {
  try {
    const session = await getSession({ req })
    const user = await User.findById(session.id)
    if (!user.admin) throw 'Unauthorized'
    const { method, body, query } = req
    let resp = []
    await User.find({})
      .then(response => resp = response)
      .catch(err => '/admin/users: ' + (err.message || err))
    res.status(200).json(resp)
  } catch (err) {
    res.status(500).json({msg: '/admin/users: ' + (err.message || err)})
  }
})