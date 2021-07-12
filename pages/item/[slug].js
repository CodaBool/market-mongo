import React, { useState, useRef, useEffect } from 'react'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Toast from '../../components/UI/Toast'
import BoxImg from '../../components/UI/BoxImg'
import ProductImg from '../../components/UI/ProductImg'
import Badge from 'react-bootstrap/Badge'
import { useSession, signIn } from 'coda-auth/client'
import { BagCheckFill } from 'react-bootstrap-icons'
import { useRouter } from 'next/router'
import { useShoppingCart } from 'use-shopping-cart'
import { usdPretty, genQuanArr, MAX_DUP_ITEMS } from '../../constants'
import Reviews from '../../components/Reviews'

// server
import { connectDB, jparse } from '../../util/db'
import { Product, Review } from '../../models'

export default function Item({ product, reviews, slug }) {
  const [ session, loading ] = useSession()
  const { addItem, totalPrice, cartDetails, formattedTotalPrice, clearCart, setItemQuantity } = useShoppingCart()
  const [showSucc, setShowSucc] = useState(false)
  const [showErr, setShowErr] = useState(false)
  const [showMaxErr, setShowMaxErr] = useState(false)
  const [overflow, setOverflow] = useState(0)
  const [variant, setVariant] = useState(product.variants.find(variant => !!variant.default))
  const router = useRouter()
  const quantity = useRef(null)

  function addToCart() {
    if (!session) {
      signIn()
      return
    }
    const selectedQuantity = Number(quantity.current.value)
    const item = { name: variant.name, description: product.description, id: variant._id, price: Number(variant.price), image: variant.images[0], productId: product._id}
    if (cartDetails[variant._id]) { // in cart
      if (cartDetails[variant._id].quantity + selectedQuantity > MAX_DUP_ITEMS) { // BUST
        const overflow = cartDetails[variant._id].quantity + selectedQuantity - MAX_DUP_ITEMS
        const maxAdd = Math.abs(selectedQuantity - overflow)
        // console.log('Fraction of', product.name, '| maxAdd', maxAdd)
        if (maxAdd) {
          setOverflow(maxAdd)
          setShowErr(true)
          setItemQuantity(variant._id, cartDetails[variant._id].quantity + maxAdd)
        } else {
          setShowMaxErr(true)
        }
      } else { // add all
        // console.log('adding ALL of existing item', product.name, 'set quantity to', cartDetails[product._id].quantity + selectedQuantity)
        setItemQuantity(variant._id, cartDetails[variant._id].quantity + selectedQuantity)
        setShowSucc(true)
      }
    } else { // new
      // adding item with quantity not supported in latest use-shopping-cart
      // instead adding single item and then calling setItemQuantity to match quantity
      addItem(item)
      setItemQuantity(variant._id, selectedQuantity)
      setShowSucc(true)
    }
  }

  function variantChange(id) {
    setVariant(product.variants.find(variant => variant._id === id))
  }

  return (
    <>
      <Card key={product._id} className="p-3">
        <Row>
          <Col className="p-0">
            <ProductImg variants={product.variants} alt={variant.name} coverImg={product.coverImg} variantChange={variantChange}  />
          </Col>
          <Col>
            <h1>{variant.name}</h1>
            {/* Tags */}
            {/* {product.metadata.categories?.split(',').map((tag, index) => (
              <Badge pill variant="secondary" className="mr-2 py-1" key={index}>
                {tag}
              </Badge>
            ))} */}
            <p>{product.description}</p>
            <div className="" style={{width: '200px'}}>
              <Row>
                <Col sm={6} className="text-center">
                  {usdPretty(variant.price)}
                </Col>
                <Col className="my-auto" sm={6}>
                  <select className="form-control" name="quantity" defaultValue="1" ref={quantity}>
                    {genQuanArr(variant.quantity).map((option, index) => <option key={index}>{option}</option>)}
                  </select>
                </Col>
              </Row>
              <p>shipping placeholder</p>
              <p>Rating placeholder</p>
              <Button variant="primary" className="w-100" onClick={addToCart}>Add to cart</Button>
            </div>
          </Col>
        </Row>
      </Card>
      <Card className="p-5">
        <h1>Details</h1>
      </Card>
      <Card className="p-5">
        <h1>Other items in this category</h1>
      </Card>
      <Card className="p-5">
        <h1>Reviews</h1>
        <Reviews buildTimeReviews={reviews} productId={slug} session={session} variants={product.variants} />
      </Card>
      <div className="toastHolder" style={{position: 'fixed', top: '80px', right: '10px'}}>
        <Toast show={showSucc} setShow={setShowSucc} title='Product Added' body={<>
          <p>You Added <strong>{quantity.current && quantity.current.value} {product.name}</strong> To Your Cart</p>
          <Button className="w-100" variant="info" onClick={() => router.push('/checkout/cart')}>See Cart <BagCheckFill className="ml-2 mb-1" size={14}/></Button>
        </>} />
        <Toast show={showErr} setShow={setShowErr} title='Maximum Reached' error body={<>
          <p>We could only add <strong>{overflow}</strong> to your cart of {product.name}</p>
          <Button className="w-100" variant="info" onClick={() => router.push('/checkout/cart')}>See Cart <BagCheckFill className="ml-2 mb-1" size={14}/></Button>
        </>} />
        <Toast show={showMaxErr} setShow={setShowMaxErr} title='Maximum Reached' error body={<>
          <p className="text-danger">Unfortunately we cannot add anymore.</p>
          <Button className="w-100" variant="light" onClick={() => router.push('/checkout/cart')}>See Cart <BagCheckFill className="ml-2 mb-1" size={14}/></Button>
        </>} />
      </div>
    </>
  )
}

export async function getStaticProps(context) {
  let { slug } = context.params
  await connectDB()
  const product = await Product.findById(slug)
  const allReviews = await Review.find({ productId: slug })
  const reviews = allReviews.filter(review => {
    if (review.published) return true
  })
  return { props: { product: jparse(product), reviews: jparse(reviews), slug } }
}

export async function getStaticPaths() {
  await connectDB()
  const products = await Product.find()
  const paths = products.map(product => ({
    params: { slug: product._id }
  }))
  console.log('/item/[slug]', paths)
  return { paths, fallback: false } // { fallback: false } means other routes should 404.
}