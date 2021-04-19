if (process.env.NEXTAUTH_URL) {
  console.log('url set =', process.env.NEXTAUTH_URL)
} else {
  const copy = process
  copy.env.NEXTAUTH_URL = process.env.NEXT_PUBLIC_URL
  console.log('setting url =', process.env.NEXTAUTH_URL)
}

// const dotenv = require('dotenv')
// const dotenvExpand = require('dotenv-expand')
// const { env } = process
// env.NEXTAUTH_URL = process.env.NEXTAUTH_URL
import axios from 'axios'
import { getCsrfToken } from 'next-auth/client'
// dotenv.config({ path: '../../.env.dev' })

// console.log('pre env 1', process.env)
// if (true) {
//   // dotenvExpand(dotenv.config({ path: '../../.envdev' }))
//   dotenv.config({ path: '../../.envdev' })
// } else {
//   require('dotenv').config({ path: '../../.env.prod' })
// }
// process.env.NEWONE = 'newEnvHereBaby'

// console.log('post env 1', process.env)



export default async (req, res) => {
  try {
    if (process.env.NEXTAUTH_URL) {
      console.log('url set =', process.env.NEXTAUTH_URL)
    } else {
      const copy = process
      copy.env.NEXTAUTH_URL = process.env.NEXT_PUBLIC_URL
      console.log('setting url =', process.env.NEXTAUTH_URL)
    }
    // console.log('pre env 1', process.env)
    // console.log('/getCSRF PRE ENV =', process.env)
    // const { env } = process
    // env.NEXTAUTH_URL = process.env.NEXTAUTH_URL
    // console.log('/getCSRF POST ENV =', process.env)
    // console.log('post env 1', process.env._NEWONE)
    // process.env[''] = 'newEnvHereBaby'
    // console.log('post env 1', process.env)

    // dotenvExpand(dotenv.config({ path: '../../.envdev' }))
    // console.log('post env 1', process.env._NEWONE)
    // console.log('pre env 2', process.env)
    // process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL 
    // console.log('post env 2', process.env)
    let res1 = null
    let res2 = null
    // const base = process.env.NEXTAUTH_URL || 'https://d1m7a4gmurbqh2.cloudfront.net'
    console.log('/getCSRF process.env.NEXTAUTH_URL =', process.env.NEXTAUTH_URL)
    // console.log('/getCSRF base =', base)
    try {
      await getCsrfToken({req})
        .then(response => {res1 = response; console.log('/getCSRF auto res', response)})
        .catch(err => console.log('/getCSRF auto err', err))
    } catch (error) {
      console.log('failed 1', error)
    }
    try {
      await axios.get(`${process.env.NEXTAUTH_URL}/api/auth/csrf`)
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