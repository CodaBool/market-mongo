export default async (req, res) => {
  try {
    console.log('_log:', req.body)
    res.status(200).json({ message: 'log recieved, check cloudwatch'})
  } catch (err) {
    console.error('_log', err)
    res.status(400).json({ message: 'error in cloudwatch api lambda /api/auth/_log' })
  }
}