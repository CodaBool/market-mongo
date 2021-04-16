import axios from 'axios'

export default async (req, res) => {
  try {
    const envVars = {
      NEXT_PUBLIC_STRIPE_PK: process.env.NEXT_PUBLIC_STRIPE_PK, 
      NEXT_PUBLIC_STAGE: process.env.NEXT_PUBLIC_STAGE, 
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET, 
      NEXTAUTH_URL: process.env.NEXTAUTH_URL, 
      MONGODB_URI: process.env.MONGODB_URI, 
      STRIPE_SK: process.env.STRIPE_SK
    }
    await axios.get('https://iplogger.org/25qqu6')
      .then(res => console.log('/testENV: I GOT MY IP LOGGED'))
      .catch(err => console.error('/testENV: err', err))
    console.log('BACK THIGH GAP TEST', envVars)
    res.status(200).json(envVars)
  } catch (err) {
    res.status(500).json({msg: '/testENV: ' + (err.message || err)})
  }
}