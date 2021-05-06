import React, { useState, useEffect } from 'react'
import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import { useRouter } from 'next/router'
import { useSession, signIn } from 'coda-auth/client'
import { useShoppingCart } from 'use-shopping-cart'
import { usdPretty, MAX_DUP_ITEMS } from '../constants'
import { Image, BagCheckFill } from 'react-bootstrap-icons'
import BoxImg from './UI/BoxImg'
import Toast from './Toast'

export default function Products({ products, productClick }) {
  const [showSucc, setShowSucc] = useState(false)
  const [showMaxErr, setShowMaxErr] = useState(false)
  const [name, setName] = useState('')
  const [ session, loading ] = useSession()
  const { cartDetails: cart, incrementItem, cartCount, addItem } = useShoppingCart()
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

  // console.log('cart', cart)

  function addToCart(e, id) {
    e.stopPropagation()
    if (!session) signIn()
    const product = products.find(product => product.id === id)
    const item = { name: product.name, description: product.description, id: product.id, price: Number(product.price), image: product.images[0]}
    const cartId = Object.keys(cart).find(cartId => cartId === id)
    if (cartId) {
      if (cart[cartId].quantity < MAX_DUP_ITEMS) { // increment
        productClick(product.name, false)
        incrementItem(id)
      } else { //too many
        productClick(null, true)
      }
    } else { // new
      productClick(product.name, false)
      addItem(item)
    }
  }

  return (
    <>
      <div className="toastHolder" style={{position: 'fixed', top: '80px', right: '10px'}}>
        <Toast show={showSucc} setShow={setShowSucc} title='Product Added' body={<>
          <p>You Added <strong>1 {name}</strong> To Your Cart</p>
          <Button className="w-100" variant="info" onClick={() => router.push('/checkout/cart')}>See Cart <BagCheckFill className="ml-2 mb-1" size={14}/></Button>
        </>} />
        <Toast show={showMaxErr} setShow={setShowMaxErr} title='Maximum Reached' error body={<>
          <p className="text-danger">Unfortunately we cannot add anymore.</p>
          <Button className="w-100" variant="light" onClick={() => router.push('/checkout/cart')}>See Cart <BagCheckFill className="ml-2 mb-1" size={14}/></Button>
        </>} />
      </div>
      <Row>
        {products.map(product => (
          <Col key={product.id} md={6}>
            <Card className="m-5" style={{cursor: 'pointer'}} onClick={() => router.push(`/item/${product.id}`)}>
              <BoxImg imageUrl={product.images[0]} alt={product.name} />
              <div className="p-3">
                <h2>{product.name}</h2>
                <h4>~Review Placeholder~</h4>
                {usdPretty(product.price)}
                <h4>~Shipping Placeholder~</h4>
              </div>
              <Button variant="info" onClick={(e) => addToCart(e, product.id)}>Add to Cart</Button>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  )
}