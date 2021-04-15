import applyMiddleware from '../../util'
import { User } from '../../models'

export default applyMiddleware(async (req, res) => {
  try {
    let resp = []
    await User.find({})
      .then(response => {
        console.log('/test then block', response)
        console.log('/test env vars =', {
          NEXT_PUBLIC_STRIPE_PK: process.env.NEXT_PUBLIC_STRIPE_PK, 
          NEXT_PUBLIC_STAGE: process.env.NEXT_PUBLIC_STAGE, 
          NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET, 
          NEXTAUTH_URL: process.env.NEXTAUTH_URL, 
          MONGODB_URI: process.env.MONGODB_URI, 
          STRIPE_SK: process.env.STRIPE_SK
        })
        resp = response
      })
      .catch(err => {
        console.log('/test catch block', err)
      })
    console.log('finished db query, sending back resp =', resp)
    res.status(200).json(resp)
  } catch (err) {
    res.status(500).json({msg: '/test: ' + (err.message || err)})
  }
})