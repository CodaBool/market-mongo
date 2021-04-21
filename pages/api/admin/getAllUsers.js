import applyMiddleware from '../../../util'
import { User } from '../../../models'

export default applyMiddleware(async (req, res) => {
  try {
    let resp = []
    await User.find({})
      .then(response => resp = response)
      .catch(err => '/admin/getAllUsers: ' + (err.message || err))
    res.status(200).json(resp)
  } catch (err) {
    res.status(500).json({msg: '/admin/getAllUsers: ' + (err.message || err)})
  }
})