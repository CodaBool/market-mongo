export default async (req, res) => {
  try {
    
    console.log('MONGODB_URI =', process.env.MONGODB_URI)
    console.log('NEXT_PUBLIC_STAGE =', process.env.NEXT_PUBLIC_STAGE)

    res.status(200).send('wowee')
  } catch (err) {
    console.log('test2 catch', err)
    res.status(400).json({ success: false })
  }
}