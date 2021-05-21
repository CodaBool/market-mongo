import applyMiddleware from '../../util'
import { Order, Product, User } from '../../models'
import { getSession } from 'coda-auth/client'
import { connectDB } from '../../util/db'

export default applyMiddleware(async (req, res) => {
  try {
    let resp = []
    let envVars = {}
    const session = await getSession({req})
    // console.log(session)
    if (!session) throw 'Unathorized'
    // console.log(session.user)
    if (process.env.NEXT_PUBLIC_STRIPE_PK) {
      envVars.NEXT_PUBLIC_STRIPE_PK = 'found'
    } else {
      envVars.NEXT_PUBLIC_STRIPE_PK = 'MISSING'
    }
    if (process.env.NEXT_PUBLIC_STAGE) {
      envVars.NEXT_PUBLIC_STAGE = process.env.NEXT_PUBLIC_STAGE
    } else {
      envVars.NEXT_PUBLIC_STAGE = 'MISSING'
    }
    if (process.env.NEXTAUTH_SECRET) {
      envVars.NEXTAUTH_SECRET = 'found'
    } else {
      envVars.NEXTAUTH_SECRET = 'MISSING'
    }
    if (process.env.MONGODB_URI) {
      envVars.MONGODB_URI = 'found'
    } else {
      envVars.MONGODB_URI = 'MISSING'
    }
    if (process.env.STRIPE_SK) {
      envVars.STRIPE_SK = 'found'
    } else {
      envVars.STRIPE_SK = 'MISSING'
    }
    if (process.env.NEXTAUTH_URL) {
      envVars.NEXTAUTH_URL = process.env.NEXTAUTH_URL
    } else {
      envVars.NEXTAUTH_URL = 'MISSING'
    }
    if (process.env.NODE_ENV) {
      envVars.NODE_ENV = process.env.NODE_ENV
    } else {
      envVars.NODE_ENV = 'MISSING'
    }
    if (process.env.NEXT_PUBLIC_NODE_ENV) {
      envVars.NEXT_PUBLIC_NODE_ENV = process.env.NEXT_PUBLIC_NODE_ENV
    } else {
      envVars.NEXT_PUBLIC_NODE_ENV = 'MISSING AS IT SHOULD BE'
    }
    await connectDB()
    const orders = await Order.find()
    const products = await Product.find()
    const stripe = require('stripe')(process.env.STRIPE_SK)
    // const customer = await stripe.customers.retrieve(session.customerId)
    //     .catch(err => { throw err.raw.message })
    const intent = await stripe.paymentIntents.retrieve(orders[0].id_stripe_intent)
    // const charge = await stripe.charges.retrieve('ch_1IsWJxAJvGrE9xG5Ji35QhPp')
    // const sSession = await stripe.checkout.sessions.retrieve('cs_test_a1NC3WUzhHNbW0eVMaydFhRH2hgBKiV2QPYeqO1cQ8yyJ3G7MvJU344U0e')
    // const line_items_stripe = await stripe.checkout.sessions.listLineItems('cs_test_a1NC3WUzhHNbW0eVMaydFhRH2hgBKiV2QPYeqO1cQ8yyJ3G7MvJU344U0e')
    // await User.findOne({})
    //   .then(response => {
    //     if (response) {
    //       response.password = undefined
    //     }
    //     resp = response
    //   })
    //   .catch(err => console.log('/test', (err.message || err)))
    // console.log(products)
    res.status(200).json({resp, envVars, order: orders[0], intent, products })
  } catch (err) {
    res.status(500).json({msg: '/test: ' + (err.message || err)})
  }
})