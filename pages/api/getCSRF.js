import { getCsrfToken } from 'coda-auth/client'

export default async (req, res) => {
  try {
    let res1 = null
    try {
      await getCsrfToken({req})
        .then(response => {
          res1 = response
          console.log('/getCSRF auto res', response)
        })
        .catch(err => console.log('/getCSRF auto err', err))
    } catch (error) {
      console.log('failed 1', error)
    }
    res.status(200).json({ res1 })
  } catch (err) {
    res.status(500).json({msg: '/getCSRF: ' + (err.message || err)})
  }
}