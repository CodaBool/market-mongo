const stripe = require('stripe')(process.env.STRIPE_SK)
import { getSession } from 'coda-auth/client'
import { Product, Order, User } from '../../../models'
import applyMiddleware from '../../../util'
import { IncomingForm } from 'formidable'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false,
  }
};

export default applyMiddleware(async (req, res) => {
  try {
    const { method, body, query } = req
    if (method === 'POST') {

      // authenticate
      const jwt = await getSession({ req })
      if (!jwt) throw 'Unauthorized, no jwt'
      const user = await User.findById(jwt.id)
      if (!user.admin) throw 'Unauthorized, not an admin account'

      const form = await new Promise((resolve, reject) => {
        const form = new IncomingForm()
        form.parse(req, (err, fields, files) => {
          if (err) return reject(err)
          resolve({ fields, files })
        })
      })

      if (!form?.fields?.name) throw 'No name provided'
      
      // const contents = await fs.readFile(data?.files?.image.path, { encoding: 'utf8' })

      // read file from the temporary path
      const data = fs.readFileSync(form?.files?.image.path)
      const upload = await stripe.files.create({
        file: {
          data,
          name: form.fields.name || 'unamed_item',
          type: 'application.octet-stream',
        },
        purpose: 'product_image',
        file_link_data: {
          create: true,
          metadata: {
            test: true
          }
        }
      })
      console.log('upload', upload)
      res.status(200).json({msg: 'hi'})
    } else if (method === 'GET') {
      
      // Create time filter
      const currentTime = Math.floor(Date.now() / 1000)
      let timeDif = 2678400 // 1 month
      if (query.filter) {
        if (query.filter === 'Last 6 Months') timeDif = 16070400 // 6 months
        if (query.filter === 'Last Year') timeDif = 32140800 // 1 year
        if (query.filter === 'All') timeDif = 1623701620 // many years
      }

      const files = await stripe.files.list({
        limit: 100,
        purpose: 'product_image',
        created: { gt: currentTime - timeDif }
      })
      // console.log('file', files.data[0].links)
      // const justNames = files.data.map(file => {
      //   return file.filename + ' | ' + file.id + ' | ' + file.links.data[0]?.url
      // })
      // console.log('justNames', justNames)
      const images = files.data.map(file => file.links.data[0]?.url)
      res.status(200).json(images)
    } else if (method === 'PUT') {
      throw 'bad route'
    } else {
      throw `Cannot use ${method} method for this route`
    }
  } catch (err) {
    // console.log('type', typeof err)
    console.log('raw', err)
    if (typeof err === 'string') {
      res.status(400).json({ msg: 'session: ' + err })
    } else {
      res.status(500).json({ msg: 'session: ' + (err.message || err)})
    }
  }
})