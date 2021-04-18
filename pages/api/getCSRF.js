import axios from 'axios'
import { getCsrfToken } from 'next-auth/client'

export default applyMiddleware(async (req, res) => {
  try {
    let res1 = null
    let res2 = null
    await getCsrfToken({req})
      .then(res => {res1 = res; console.log('/getCSRF auto res', res)})
      .catch(err => console.log('/getCSRF auto err', err))
    await axios.get('/api/auth/csrf')
      .then(res => {res2 = res; console.log('/getCSRF manual res', res)})
      .catch(err => console.log('/getCSRF manual err', err))
    console.log('finished db query, sending back resp =', resp)
    res.status(200).json({ res1, res2})
  } catch (err) {
    res.status(500).json({msg: '/getCSRF: ' + (err.message || err)})
  }
})