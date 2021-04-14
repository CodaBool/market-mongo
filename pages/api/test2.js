export default async (req, res) => {
  try {
    
    console.log('MONGODB_URI =', process.env.MONGODB_URI)
    console.log('NEXT_PUBLIC_STAGE =', process.env.NEXT_PUBLIC_STAGE)
    console.log('finished test endpoint sending back string')

    res.status(200).send('wowee')
  } catch (err) {
    console.log('/api/test2 catch', err)
    res.status(400).send('test2 endpoint err, see CloudWatch logs for api')
  }
}