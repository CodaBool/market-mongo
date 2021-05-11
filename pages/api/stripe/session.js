const stripe = require('stripe')(process.env.STRIPE_SK)
// const validateSKU = require('use-shopping-cart/utilities').validateCartItems // only checks that each sku exists 
import { getSession } from 'coda-auth/client'
import { Product, User } from '../../../models'
import applyMiddleware from '../../../util'
import { MAX_DUP_ITEMS } from '../../../constants'


const inventory = [
  {
    "name": "New Valencia Product",
    "sku": "prod_IWYxENlgBE5gIx",
    "price": 991,
    "image": "https://files.stripe.com/links/fl_test_tbN5CakXUa74ea6hnFdPaiUs",
    "currency": "usd"
  },
  {
    "name": "lol xd random",
    "sku": "prod_IJ2asdCfoO1Go5",
    "price": 999,
    "image": "https://files.stripe.com/links/fl_test_OjJltdq7JWUQB6ni5NQIhmZm",
    "currency": "usd"
  },
  {
    "name": "lol xd randosdfsdm",
    "sku": "prod_IETwLgxefSHPPv",
    "price": 150,
    "image": "https://files.stripe.com/links/fl_test_F5RMQIftj5XYCKI4Ds37SifT",
    "currency": "usd"
  }
]

export default applyMiddleware(async (req, res) => {
  try {

    // Authenticated users only
    const jwt = await getSession({ req })
    if (!jwt) throw 'Unauthorized'

    const { method, body, query } = req
    // console.log('in session with customer', session)
    console.log('in session with customer', jwt.customerId)
    if (method === 'POST') {
      const products = await Product.find()
      const line_items = validate(products, body)
      // const user = await User.findById(jwt.id)
      // console.log('user =', user)

      const session = await stripe.checkout.sessions.create({
        success_url: 'http://localhost:3000/checkout/confirmed?id={CHECKOUT_SESSION_ID}',
        // success_url: 'https://example.com/success',
        cancel_url: 'http://localhost:3000/checkout/cancelled?id={CHECKOUT_SESSION_ID}',
        payment_method_types: ['card'],
        line_items,
        customer: jwt.customerId,
        billing_address_collection: 'auto',
        mode: 'payment',
        // shipping_rates: 1,
        shipping_address_collection: {
          allowed_countries: ['US']
        },
      })
      // console.log('server session', session)
      res.status(200).json({id: session.id})
    } else if (method === 'GET') {
      throw 'bad route'
    } else if (method === 'PUT') {
      throw 'bad route'
    } else {
      throw `Cannot use ${method} method for this route`
    }
  } catch (err) {
    // console.log('type', typeof err)
    // console.log('raw', err)
    if (typeof err === 'string') {
      res.status(400).json({ msg: 'session: ' + err })
    } else {
      res.status(500).json({ msg: 'session: ' + (err.message || err)})
    }
  }
})


function validate(source, cart) {
  const validatedItems = []
  
  if (!cart) throw 'No products in cart'
  
  for (const id in cart) {
    // console.log(source)
    const item = source.find(product => product._id === id)
    console.log('match', item, '@', id)
    // verify that all ids exist in source
    if (!item) throw `No product in source with id "${id}"`
    // verify that the local has the correct price
    // console.log('compare price', cart[id].price, 'vs', item.price)
    if (cart[id].price !== item.price) throw 'Price discrepency'

    // verify that the local does not go over store duplicate limit
    // console.log('check if over max', cart[id].quantity, 'vs', MAX_DUP_ITEMS)
    if (cart[id].quantity > MAX_DUP_ITEMS) throw 'Exceeding max per customer limit'
    
    // verify that the local does not go over store supply
    // console.log('check if over supply', cart[id].quantity, 'vs', item.quantity)
    if (cart[id].quantity > item.quantity) throw 'Exceeding supply limit'
    
    // don't allow empty quantity
    if (cart[id].quantity === 0) throw 'Empty quantity'
    
    // ALL GOOD
    // console.log('YOUR GOOD to checkout with', id)
    
    // set proper form for checkout session

    if (!item.images[0]) throw 'Improper market image'
    // if (!item.description) throw 'Improper market description'
    // if (!item.currency) throw 'Improper market currency'
    const line = {
      quantity: cart[id].quantity,
      price_data: {
        currency: item.currency || 'USD', // TODO: WARNING default should come from MONGO
        unit_amount: item.price,
        product_data: {
          name: item.name,
          description: item.description,
          images: [item.images[0]]
          // ...item.product_data
        },
        // ...item.price_data
      }
    }
    validatedItems.push(line)
  }

  // for (const id in cartDetails) {
  //   // const product = cartDetails[itemId]
  //   const inventoryItem = inventorySrc.find(
  //     (currentProduct) => currentProduct.sku === id || currentProduct.id === id
  //   )
  //   if (inventoryItem === undefined) {
  //     throw new Error(
  //       `Invalid Cart: product with id "${id}" is not in your inventory.`
  //     )
  //   }

    // const item = {
    //   quantity: cartDetails[id].quantity,
    //   price_data: {
    //     currency: inventoryItem.currency,
    //     unit_amount: inventoryItem.price,
    //     product_data: {
    //       name: inventoryItem.name,
    //       ...inventoryItem.product_data
    //     },
    //     ...inventoryItem.price_data
    //   }
    // }

  //   if (typeof cartDetails[id].product_data?.metadata === 'object') {
  //     item.price_data.product_data.metadata = {
  //       ...item.price_data.product_data.metadata,
  //       ...cartDetails[id].product_data.metadata
  //     }
  //   }

  //   if (
  //     typeof inventoryItem.description === 'string' &&
  //     inventoryItem.description.length > 0
  //   )
  //     item.price_data.product_data.description = inventoryItem.description

  //   if (
  //     typeof inventoryItem.image === 'string' &&
  //     inventoryItem.image.length > 0
  //   )
  //     item.price_data.product_data.images = [inventoryItem.image]

  //   validatedItems.push(item)
  // }

  return validatedItems
}

// copy of use-shopping-cart@3.0.0-beta.5 validateCartItems
// Lacked validation quantity and price, only validated SKU
// Due to this limitation. Creating local version which will validate
// for all 3 (price, sku, quantity) and return in proper Stripe line_items format

const validateOld = (inventorySrc, cartDetails) => {
  const validatedItems = []

  for (const id in cartDetails) {
    // const product = cartDetails[itemId]
    const inventoryItem = inventorySrc.find(
      (currentProduct) => currentProduct.sku === id || currentProduct._id === id
    )
    if (inventoryItem === undefined) {
      throw new Error(
        `Invalid Cart: product with id "${id}" is not in your inventory.`
      )
    }

    const item = {
      price_data: {
        currency: inventoryItem.currency,
        unit_amount: inventoryItem.price,
        product_data: {
          name: inventoryItem.name,
          ...inventoryItem.product_data
        },
        ...inventoryItem.price_data
      },
      quantity: cartDetails[id].quantity
    }

    if (typeof cartDetails[id].product_data?.metadata === 'object') {
      item.price_data.product_data.metadata = {
        ...item.price_data.product_data.metadata,
        ...cartDetails[id].product_data.metadata
      }
    }

    if (
      typeof inventoryItem.description === 'string' &&
      inventoryItem.description.length > 0
    )
      item.price_data.product_data.description = inventoryItem.description

    if (
      typeof inventoryItem.image === 'string' &&
      inventoryItem.image.length > 0
    )
      item.price_data.product_data.images = [inventoryItem.image]

    validatedItems.push(item)
  }

  return validatedItems
}