import BrowseNav from '../../components/BrowseNav'
import Products from '../../components/Products'

// server
import { PRODUCTS_PER_PAGE, genQuanArr } from '../../constants'
import { connectDB } from '../../util/db'
import { Product } from '../../models'

export default function BrowsePage({ products, totalPages, slug }) {
  if (!products) return <h1 className="display-4 m-5">No Items for sale</h1>

  return (
    <>
      <h1 className="display-3 mt-3">Products</h1>
      <Products products={products} />
      <BrowseNav totalPages={totalPages} page={slug} />
    </>
  )
}

export async function getStaticProps(context) {
  // TODO: create a function in api and call that here
  const stripe = require('stripe')(process.env.STRIPE_SK)
  let products = []
  let totalPages = 1
  let { slug } = context.params

  const all = await stripe.products.list({limit: 100, active: true}) // starting_after: pagination, uses id
  if (all.has_more === true) {
    console.log('over 100 active products') // TODO: pagination
  } else {
    if (all) {

      // add price and quantity from mongo
      await connectDB()
      const mongoProducts = await Product.find()
      console.log(all.data.length, '&', mongoProducts.length)
      for (const mongoProd of mongoProducts) {
        for (const index in all.data) {
          if (mongoProd._id === all.data[index].id) {
            all.data[index].price = mongoProd.price
            all.data[index].quantity = mongoProd.quantity
          }
        }
      }

      // console.log('all', all)
      totalPages = Math.ceil(all.data.length / PRODUCTS_PER_PAGE) || 1
      // Splits products into small arrays of the max page size
      let i = 0, j, tempArr, chunk = PRODUCTS_PER_PAGE, splitArr = []
      for (i = 0 , j = all.data.length; i < j; i += chunk) {
        tempArr = all.data.slice(i, i + chunk)
        splitArr.push(tempArr)
      }
      products = splitArr[slug - 1]

      if (all.data.length === 0) return { props: {products: null, totalPages, slug } }
    } else {
      console.log('could not find products')
      return { props: {products: null, totalPages, slug }, revalidate: 1 }
    }
  }
  return { props: {products, totalPages, slug }, revalidate: 1 }
}

export async function getStaticPaths() {
  const stripe = require('stripe')(process.env.STRIPE_SK)
  let paths = []
  if (stripe) {
    const products = await stripe.products.list({limit: 100, active: true}) // starting_after: pagination, uses id
    if (products.has_more === true) {
      console.log('over 100 active products, build pagination') // TODO: pagination
    } else {
      if (products) {
        const length = Math.ceil(products.data.length / PRODUCTS_PER_PAGE) || 1
        paths = genQuanArr(length).map(page => ({
          params: { slug: String(page) },
        }))
      } else {
        console.log('no products found')
        return { paths: [ { params: { slug: '1' } } ] }
      }
    }
  } else {
    console.log('could not make instantiate stripe')
  }
  console.log('browse/[slug] paths', paths)
  return { paths, fallback: false } // { fallback: false } means other routes should 404.
}