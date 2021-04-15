import { connectDB } from '../../util/db'
import { User } from '../../models'

export default async (req, res) => {
  try {
    console.log('/testwoMiddleWare using await on connectDB')
    await connectDB()
    let resp = []
    await User.find({})
      .then(response => {
        console.log('/testwoMiddleWare then block', response)
        console.log('/testwoMiddleWare env vars =', {
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
        console.log('/testwoMiddleWare catch block', err)
        if (err.message) {
          console.log('/testwoMiddleWare catch block err.message =', err.message)
        }
      })
    console.log('finished db query, sending back resp =', resp)
    res.status(200).json(resp)
  } catch (err) {
    res.status(500).json({msg: '/testwoMiddleWare: ' + (err.message || err)})
  }
}