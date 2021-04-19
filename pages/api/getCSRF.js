console.log('pre env 1', process.env)
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL 
console.log('post env 1', process.env)
import axios from 'axios'
import { getCsrfToken } from 'coda-auth/client'

export default async (req, res) => {
  try {
    console.log('pre env 2', process.env)
    process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL 
    console.log('post env 2', process.env)
    let res1 = null
    let res2 = null
    const base = process.env.NEXTAUTH_URL || 'https://d1m7a4gmurbqh2.cloudfront.net'
    console.log('/getCSRF process.env.NEXTAUTH_URL =', process.env.NEXTAUTH_URL)
    console.log('/getCSRF base =', base)
    try {
      await getCsrfToken({req})
        .then(response => {res1 = response; console.log('/getCSRF auto res', response)})
        .catch(err => console.log('/getCSRF auto err', err))
    } catch (error) {
      console.log('failed 1', error)
    }
    try {
      await axios.get(`${base}/api/auth/csrf`)
      .then(response => {res2 = response.data; console.log('/getCSRF manual res', response)})
      .catch(err => console.log('/getCSRF manual err', err))
    } catch (error) {
      console.log('failed 2', error)
    }
    res.status(200).json({ res1, res2})
  } catch (err) {
    res.status(500).json({msg: '/getCSRF: ' + (err.message || err)})
  }
}