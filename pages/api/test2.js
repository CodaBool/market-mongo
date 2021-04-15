export default async (req, res) => {
  try {
    
    console.log('MONGODB_URI =', process.env.MONGODB_URI)
    console.log('NEXT_PUBLIC_STAGE =', process.env.NEXT_PUBLIC_STAGE)
    console.log('NEXTAUTH_URL =', process.env.NEXTAUTH_URL)


    // TEST2 has the nextauth_url env, meaning 

    const envVars = { uri: process.env.MONGODB_URI, stage: process.env.NEXT_PUBLIC_STAGE, auth: process.env.NEXTAUTH_URL}

    res.status(200).json(envVars)
  } catch (err) {
    console.log('/api/test2 catch', err)
    res.status(400).json({ message: 'test2 endpoint err, see CloudWatch logs for api' })
  }
}