import applyMiddleware from '../../util'
import { getSession } from 'coda-auth/client'
import { Review, Order, User, Product } from '../../models'

export default applyMiddleware(async (req, res) => {
  try {
    const { method, body, query } = req
    const session = await getSession({ req })
    if (!session) throw 'Unauthorized'
    if (method === 'POST') {
      // console.log('body', body)

      // verify email validation
      const user = await User.findById(session.id)
      console.log('user', user)
      if (!user.verified) throw 'You must verify your account before writing a review'

      // verify first review written for this product
      const userReviews = await Review.find({ author: session.id })
      const reviewExists = userReviews.find(review => review.productId === body.productId && !review.archived)
      if (reviewExists) throw 'A review for this product already exists'

      // verify an this product has been ordered
      const userOrders = await Order.find({ user: session.id })
      const orderExists = userOrders.find(order => {
        const hasThisProduct = order.items.find(item => item.id_prod === body.productId)
        if (hasThisProduct) return true
      })
      if (!orderExists) throw 'Only customers who have purchased the product can write reviews'

      const review = await Review.create({
        productId: body.productId,
        author: session.id,
        content: body.content,
        stars: body.rating,
        avatar: session.user.image,
        variant: {
          image: body.variant.images[0],
          name: body.variant.name,
          _id: body.variant._id
        },
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
    } else if (method === 'PUT') {

      if (!body._id) throw 'No review id provided'

      const review = await Review.findById(body._id)

      if (!review) throw 'No review found by that id'
      
      console.log('request from', session.id)
      console.log('review author is', review.author)

      // verify that this is the review owner
      if (session.id !== String(review.author)) throw 'The review provided is not under your account'

      // edit the review status
      review.published = false
      review.archived = true
      await review.save()

      res.status(200).json(review)
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