import dbConnect from '../../util/db'
import { User } from '../../models'

export default async (req, res) => {
  try {
    await dbConnect()
    let resp = []
    await User.find({})
      .then(response => resp = response)
      .catch(err => console.log(err))
    console.log('finished db query, sending back resp =', resp)
    res.status(200).json(resp)
  } catch (err) {
    console.log('/api/test catch', err)
    res.status(400).send('test endpoint err, see CloudWatch logs for api')
  }
}