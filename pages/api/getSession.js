import axios from 'axios'
import { getSession } from 'coda-auth/client'

export default async (req, res) => {
  try {
    let res1 = null
    let res2 = null
    console.log('/getSession process.env.NEXTAUTH_URL =', process.env.NEXTAUTH_URL)
    try {
      await getSession({ req })
        .then(response => {res1 = response; console.log('/getSession auto res', response)})
        .catch(err => console.log('/getSession auto err', err))
    } catch (error) {
      console.log('failed 1', error)
    }
    try {
      if (process.env.NEXTAUTH_URL) {
        await axios.get(`${process.env.NEXTAUTH_URL}/api/auth/session`)
          .then(response => res2 = response.status)
          .catch(err => console.log('/getSession manual err2', err))
      } else {
        console.log('/getSession no NEXTAUTH_URL found for a session call')
      }
    } catch (error) {
      console.log('failed 2', error)
    }
    res.status(200).json({ res1, res2})
  } catch (err) {
    res.status(500).json({msg: '/getSession: ' + (err.message || err)})
  }
}