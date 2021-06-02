export default async (req, res) => {
  try {
    console.log('authorize:', req.body, req.query)
    res.status(200).json({ message: 'authorize'})
  } catch (err) {
    console.error('authorize', err)
    res.status(400).json({ message: 'authorize' })
  }
}