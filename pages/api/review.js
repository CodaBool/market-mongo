import applyMiddleware from '../../util'
import { getSession } from 'coda-auth/client'
import { Review, Order } from '../../models'

export default applyMiddleware(async (req, res) => {
  try {
    const { method, body, query } = req
    const session = await getSession({ req })
    if (!session) throw 'Unauthorized'
    if (method === 'POST') {
      console.log('body', body)
      // VALIDATION: check that an order is processing AND check that a review does not exist already
      const userOrders = await Order.find({ user: session.id })
      const userReviews = await Review.find({ author: session.id })
      const orderExists = userOrders.find(order => {
        const hasThisProduct = order.items.find(item => item.id_prod === body.productId)
        if (hasThisProduct) return true
      })
      if (!orderExists) throw 'Only customers who have purchased the product can write reviews'
      const reviewExists = userReviews.find(review => review.productId === body.productId)
      if (reviewExists) throw 'A review for this product already exists'

      const review = await Review.create({
        productId: body.productId,
        author: session.id,
        content: body.content,
        stars: body.rating,
        avatar: session.user.image,
        title: body.title,
      })
      // console.log('review', review)
      res.status(200).json({review: review._id})
    } else if (method === 'GET') {
      const allReviews = await Review.find({ productId: query.productId })
      const reviews = allReviews.filter(review => {
        if (review.published) return true
        // console.log('is author', String(review.author) === session.id, 'with session id', session.id)
        if (String(review.author) === session.id) return true
      })
      // console.log('reviews', reviews)
      // console.log('returning', reviews.length, 'reviews')
      res.status(200).json(reviews)
    } else {
      throw `Cannot use ${method} method for this route`
    }
  } catch (err) {
    console.log(err)
    if (typeof err === 'string') {
      res.status(400).json({ msg: err })
    } else {
      res.status(500).json({ msg: err.message || err})
    }
  }
})