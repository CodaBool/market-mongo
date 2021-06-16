import { getSession } from 'coda-auth/client'
import applyMiddleware from '../../../../util'
import { castToObjectId } from '../../../../util/db'
import { Product } from '../../../../models'
import { User } from '../../../../models'

export default applyMiddleware(async (req, res) => {
  try {
    const session = await getSession({ req })
    const user = await User.findById(session.id)
    if (!user.admin) throw 'Unauthorized'
    const { method, body, query } = req
    if (method === 'POST') {
      const product = await Product.create(body)
      console.log(product)
      res.status(200).json(product)
    } else if (method === 'GET') { // null if user not found
      if (query._id) { // one
        const product = await Product.findOne({_id: query._id})
        res.status(200).json(product)
      } else { // many
        const products = await Product.find()
        res.status(200).json(products)
      }
    } else if (method === 'PUT') {
      if (body.delete) {
        const product = await Product.findById(body._id)
        product.variants = product.variants.filter(variant => String(variant._id) !== body.variantId)
        await product.save()
        res.status(200).json(product)
      } else if (body.create) {

        const images = []
        for (let i = 0; i < 5; i++) {
          console.log(`img-${i} =`, body.data[`img-${i}`])
          if (body.data[`img-${i}`]) {
            images.push(body.data[`img-${i}`])
          }
        }
  
        const newVariant = {
          name: body.data.name,
          price: Number(body.data.price),
          quantity: Number(body.data.quantity),
          default: body.data.default === 'true',
          images
        }
  
        const product = await Product.findById(body._id)
        product.variants.push(newVariant)
        console.log('product', product)
        await product.save()
        res.status(200).json(product)
      } else { // update
        const product = await Product.findById(body._id)

        const variants = []
        for (const id in product.variants) {
          const images = []
          for (let index = 0; index < 5; index++) {
            if (body.data[`img-${id}-${index}`]) {
              images.push(body.data[`img-${id}-${index}`])
              // console.log('id of', body.data[`id-${id}`], 'at index', index, 'with url of',  body.data[`img-${id}-${index}`])
            }
          }
          const variant = { 
            _id: castToObjectId(body.data[`id-${id}`]),
            name: body.data[`name-${id}`],
            default: body.data[`default-${id}`] === 'true',
            quantity: Number(body.data[`quantity-${id}`]),
            price: Number(body.data[`price-${id}`]),
            images,
          }
          variants.push(variant)
        }
        
        product.variants = variants
        product._id = body.data._id
        product.currency = body.data.currency
        product.description = body.data.description
        product.coverImg = body.data.coverImg
        product.active = body.data.active === 'true'
        product.livemode = body.data.livemode === 'true'
        await product.save()

        res.status(200).json(product)
      }
    } else {
      throw `Cannot use ${method} method for this route`
    }
  } catch (err) {
    console.log(err)

    if (typeof err === 'string') {
      res.status(400).json({ msg: '/admin/mongo/product: ' + err })
    } else {
      res.status(500).json({ msg: '/admin/mongo/product: ' + (err.message || err)})
    }
  }
})