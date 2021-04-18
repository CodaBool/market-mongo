import getConfig from 'next/config'

export default async (req, res) => {
  try {
    let envVars = {}
    const { publicRuntimeConfig } = getConfig()
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
    if (publicRuntimeConfig.NEXTAUTH_URL) {
      envVars.RUNTIME_NEXTAUTH_URL = publicRuntimeConfig.NEXTAUTH_URL
    } else {
      envVars.RUNTIME_NEXTAUTH_URL = 'MISSING'
    }
    if (process.env.NEXTAUTH_URL) {
      envVars.NEXTAUTH_URL = process.env.NEXTAUTH_URL
    } else {
      envVars.NEXTAUTH_URL = 'MISSING'
    }
    if (process.env.RANDO) {
      envVars.RANDO = process.env.RANDO
    } else {
      envVars.RANDO = 'MISSING'
    }
    if (process.env.NEXTAUTH_URL_INTERNAL) {
      envVars.NEXTAUTH_URL_INTERNAL = process.env.NEXTAUTH_URL_INTERNAL
    } else {
      envVars.NEXTAUTH_URL_INTERNAL = 'MISSING'
    }
    // console.log(envVars)
    res.status(200).json(envVars)
  } catch (err) {
    res.status(500).json({msg: '/testENV: ' + (err.message || err)})
  }
}