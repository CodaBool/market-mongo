import BrowseNav from '../../components/BrowseNav'
import Products from '../../components/Products'

// server
import { PRODUCTS_PER_PAGE, genQuanArr } from '../../constants'
import { connectDB, jparse } from '../../util/db'
import { Product } from '../../models'

export default function BrowsePage({ products, totalPages, slug }) {
  if (!products) return <h1 className="display-4 m-5">Store Maintenance</h1>

  return (
    <>
      <h1 className="display-3 mt-3">Products</h1>
      <Products products={products} />
      <BrowseNav totalPages={totalPages} page={slug} />
    </>
  )
}

export async function getStaticProps(context) {
  let totalPages = 1
  let { slug } = context.params

  await connectDB()
  const allProducts = await Product.find().catch(console.log)
  if (!allProducts) return { props: {} }
  totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE) || 1
  // Splits products into small arrays of the max page size
  let i = 0, j, tempArr, chunk = PRODUCTS_PER_PAGE, splitArr = []
  for (i = 0 , j = allProducts.length; i < j; i += chunk) {
    tempArr = allProducts.slice(i, i + chunk)
    splitArr.push(tempArr)
  }
  const products = splitArr[slug - 1]
  // if (all.data.length === 0) return { props: {products: null, totalPages, slug } }
  return { props: {products: jparse(products), totalPages, slug }, revalidate: 1 }
}

export async function getStaticPaths() {
  let paths = []
  
  await connectDB()
  const products = await Product.find().catch(console.log)

  if (products) {
    const length = Math.ceil(products.length / PRODUCTS_PER_PAGE) || 1
    paths = genQuanArr(length).map(page => ({
      params: { slug: String(page) },
    }))
  } else {
    console.log('no products found')
    return { paths: [ { params: { slug: '1' } } ], fallback: false }
  }
  console.log('browse/[slug] paths', paths)
  return { paths, fallback: false } // { fallback: false } means other routes should 404.
}