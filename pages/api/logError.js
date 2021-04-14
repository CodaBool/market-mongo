export default async (req, res) => {
  try {
    
    console.log('TESTING ERROR LOGGING, INTENTIONAL ERROR INCOMING')

    envVars = { uri: 'break now'}

    res.status(200).json(envVars)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}