import React, { useState } from 'react'
import Button from 'react-bootstrap/Button'
import BrowseNav from '../../components/BrowseNav'
import { BagCheckFill } from 'react-bootstrap-icons'
import Toast from '../../components/Toast'
import Products from '../../components/Products'
import { useRouter } from 'next/router'

// server
import { PRODUCTS_PER_PAGE } from '../../constants'
import { connectDB } from '../../util/db'
import { Product } from '../../models'

export default function BrowsePage({ products, totalPages, slug }) {
  if (!products) return <h1 className="display-4 m-5">No Items for sale</h1>

  const [showSucc, setShowSucc] = useState(false)
  const [showMaxErr, setShowMaxErr] = useState(false)
  const [name, setName] = useState('')
  const router = useRouter()

  function productClick(name, err) {
    setName(name)
    if (err) {
      setShowSucc(false)
      setShowMaxErr(true)
    } else {
      setShowSucc(true)
    }
  }

  return (
    <>
      <h1 className="display-3 mt-3">Products</h1>
      <Products products={products} productClick={productClick}/>
      <BrowseNav totalPages={totalPages} page={slug} />

      {/* TODO: Maybe able to DRY this with the Toast section in item/[slug].js */}
      <div style={{position: 'fixed', top: '80px', right: '10px'}}>
        <Toast show={showSucc} setShow={setShowSucc} title='Product Added' body={<>
          <p>You Added <strong>1 {name}</strong> To Your Cart</p>
          <Button className="w-100" variant="info" onClick={() => router.push('/checkout/cart')}>See Cart <BagCheckFill className="ml-2 mb-1" size={14}/></Button>
        </>} />
        <Toast show={showMaxErr} setShow={setShowMaxErr} title='No More Available' error body={<>
          <p className="text-danger">Unfortunately we have limited availability of that item and cannot add anymore.</p>
          <Button className="w-100" variant="light" onClick={() => router.push('/checkout/cart')}>See Cart <BagCheckFill className="ml-2 mb-1" size={14}/></Button>
        </>} />
      </div>
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
        paths = Array.from({length}, (x, i) => String(i + 1)).map(page => ({
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