import dbConnect from '../../util/db'
import { User } from '../../models'

export default async (req, res) => {
  try {
    await dbConnect()
    let resp = []
    await User.find({})
      .then(response => resp = response)
      .catch(err => console.log(err))
    res.status(200).json(resp)
  } catch (err) {
    console.log('test catch', err)
    // res.status(500).send(err)
    res.status(400).json({ success: false })
  }
}