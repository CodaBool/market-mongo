import React, { useState, useEffect } from 'react'
import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import { useRouter } from 'next/router'
import { useSession, signIn } from 'next-auth/client'
import { useShoppingCart } from 'use-shopping-cart'
import { usdPretty } from '../constants'
import { Image } from 'react-bootstrap-icons'
import BoxImg from './UI/BoxImg'

export default function Products({ products, productClick }) {
  const [ session, loading ] = useSession()
  const [imgLoading, setImgLoading] = useState(false)
  const { cartDetails, incrementItem, cartCount, addItem } = useShoppingCart()
  const router = useRouter()

  function addToCart(e, id) { // no cart items
    e.stopPropagation()
    if (session) {
      let maxAllowed, inCart = 0
      let item = {}
      let name = ''
      
      for (let key in cartDetails) { // find how many are already in the cart
        if (cartDetails[key].sku === id) {
          inCart = cartDetails[key].quantity
        }
      }
      
      products.forEach(product => { // find max quantity that can be added
        if (product.id === id) {
          name = product.name
          maxAllowed = product.metadata.quantity
          item = { max: Number(product.metadata.quantity), rando: 'lol xd random', name: product.name, description: product.description, sku: product.id, price: Number(product.metadata.price), currency: product.metadata.currency, image: product.images[0]}
        }
      })
    
      if (inCart < maxAllowed) {
        productClick(name, false)
        if (inCart > 0) {
          incrementItem(id)
        } else {
          addItem(item)
        }
      } else {
        productClick(null, true) // show error toast
      }
    } else {
      signIn()
    }
  }

  return (
    <>
      <Row>
        {products.map((product) => (
          <Col key={product.id} md={6}>
            <Card className="m-5" style={{cursor: 'pointer'}} onClick={() => router.push(`/item/${product.id}`)}>
              <BoxImg product={product} />
              <div className="p-3">
                <h2>{product.name}</h2>
                <h4>~Review Placeholder~</h4>
                {usdPretty(product.metadata.price)}
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