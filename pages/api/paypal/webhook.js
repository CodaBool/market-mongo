export default async (req, res) => {
  try {
    const { body, query } = req
    console.log('body', body)
    console.log('query', query)
    console.log(req)
    res.status(200).json({msg: 'ok'})
  } catch (err) {
    console.log('/webhook/paypal: ', err)
    res.status(500).json({msg: '/webhook/paypal: ' + (err.message || err)})
  }
}