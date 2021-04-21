import applyMiddleware from '../../util'
import { User } from '../../models'

export default applyMiddleware(async (req, res) => {
  try {
    let resp = []
    let envVars = {}
    if (process.env.NEXT_PUBLIC_STRIPE_PK) {
      envVars.NEXT_PUBLIC_STRIPE_PK = 'found'
    } else {
      envVars.NEXT_PUBLIC_STRIPE_PK = 'MISSING'
    }
    if (process.env.NEXT_PUBLIC_STAGE) {
      envVars.NEXT_PUBLIC_STAGE = process.env.NEXT_PUBLIC_STAGE
    } else {
      envVars.NEXT_PUBLIC_STAGE = 'MISSING'
    }
    if (process.env.NEXTAUTH_SECRET) {
      envVars.NEXTAUTH_SECRET = 'found'
    } else {
      envVars.NEXTAUTH_SECRET = 'MISSING'
    }
    if (process.env.MONGODB_URI) {
      envVars.MONGODB_URI = 'found'
    } else {
      envVars.MONGODB_URI = 'MISSING'
    }
    if (process.env.STRIPE_SK) {
      envVars.STRIPE_SK = 'found'
    } else {
      envVars.STRIPE_SK = 'MISSING'
    }
    if (process.env.NEXTAUTH_URL) {
      envVars.NEXTAUTH_URL = process.env.NEXTAUTH_URL
    } else {
      envVars.NEXTAUTH_URL = 'MISSING'
    }
    await User.findOne({})
      .then(response => {
        if (response) {
          response.password = undefined
        }
        resp = response
      })
      .catch(err => console.log('/test', (err.message || err)))
    res.status(200).json({resp, envVars})
  } catch (err) {
    res.status(500).json({msg: '/test: ' + (err.message || err)})
  }
})