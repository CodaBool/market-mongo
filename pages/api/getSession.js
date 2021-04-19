import axios from 'axios'
import { getSession } from 'coda-auth/client'

export default async (req, res) => {
  try {
    let res1 = null
    let res2 = null
    const base = process.env.NEXTAUTH_URL || 'https://d1m7a4gmurbqh2.cloudfront.net'
    console.log('/getSession process.env.NEXTAUTH_URL =', process.env.NEXTAUTH_URL)
    console.log('/getSession base =', base)
    try {
      await getSession({ req })
        .then(response => {res1 = response; console.log('/getSession auto res', response)})
        .catch(err => console.log('/getSession auto err', err))
    } catch (error) {
      console.log('failed 1', error)
    }
    try {
      await axios.get(`${base}/api/auth/session`)
      .then(response => {res2 = response.data; console.log('/getSession manual res', response)})
      .catch(err => console.log('/getSession manual err', err))
    } catch (error) {
      console.log('failed 2', error)
    }
    res.status(200).json({ res1, res2})
  } catch (err) {
    res.status(500).json({msg: '/getSession: ' + (err.message || err)})
  }
}