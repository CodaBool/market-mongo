import applyMiddleware from '../../util'
import { User } from '../../models'

export default applyMiddleware(async (req, res) => {
  try {
    let resp = []
    await User.find({})
      .then(response => resp = response)
      .catch(err => console.log(err))
    console.log('finished db query, sending back resp =', resp)
    res.status(200).json(resp)
  } catch (err) {
    res.status(500).json({msg: '/test: ' + (err.message || err)})
  }
})