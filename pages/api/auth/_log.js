export default async (req, res) => {
  try {
    console.log('/api/auth/_log', req)
    res.status(200).json({ message: 'log recieved, check cloudwatch'})
  } catch (err) {
    console.log('/api/auth/_log catch', err)
    res.status(400).json({ message: 'error in cloudwatch api lambda /api/auth/_log' })
  }
}
