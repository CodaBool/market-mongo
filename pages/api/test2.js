export default async (req, res) => {
  try {
    
    console.log('MONGODB_URI =', process.env.MONGODB_URI)
    console.log('NEXT_PUBLIC_STAGE =', process.env.NEXT_PUBLIC_STAGE)
    console.log('NEXTAUTH_URL =', process.env.NEXTAUTH_URL)

    const envVars = { uri: process.env.MONGODB_URI, stage: process.env.NEXT_PUBLIC_STAGE, auth: process.env.NEXTAUTH_URL}

    res.status(200).json(envVars)
  } catch (err) {
    res.status(500).json({msg: '/test2: ' + (err.message || err)})
  }
}