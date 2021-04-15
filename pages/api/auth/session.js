export default async (req, res) => {
  try {
    console.log('/api/auth/session raw req:', req)
    res.status(200).json({ msg: 'log recieved, check cloudwatch'})
  } catch (err) {
    console.log('/api/auth/session catch err =',  err)
    if (err.message) {
      console.log('/api/auth/session catch err.message =', err.message)
    }
    res.status(400).json({ msg: '/api/auth/session err' + (err.message || err) })
  }
}
