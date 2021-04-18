import axios from 'axios'

export default async (req, res) => {
  try {
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
      envVars.NEXTAUTH_SECRET = process.env.NEXTAUTH_URL
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
    // console.log(envVars)
    res.status(200).json(envVars)
  } catch (err) {
    res.status(500).json({msg: '/testENV: ' + (err.message || err)})
  }
}