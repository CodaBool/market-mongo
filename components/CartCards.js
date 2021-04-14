import React, { useState, useEffect, createRef } from 'react'
import { useShoppingCart } from 'use-shopping-cart'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import { X } from 'react-bootstrap-icons'
import Spinner from 'react-bootstrap/Spinner'
import BoxImg from './UI/BoxImg'

let madeSelects = false
const refs = []

function usd(price) {
  return '$' + String(price).slice(0, -2) + "." + String(price).slice(-2)
}

export default function CartCards({ isSimple, size }) {
  const { cartDetails, removeItem, cartCount, setItemQuantity } = useShoppingCart()
  const [selects, setSelects] = useState({})

  function genSelects() {
    let tempSelects = {}
    Object.keys(cartDetails).map(item => {
      // console.log('max quantity', cartDetails[item].max, 'for', cartDetails[item].name)
      const newRef = createRef()
      refs.push(newRef)
      tempSelects = {
        ...tempSelects,
        // [item]: <QuanSelect
        //   quantity={cartDetails[item].max} // max quantity
        //   id={item} 
        //   ref={newRef}
        //   onSelect={(e) => setItemQuantity(item, e.target.value)} 
        // />
        [item]: 
          <select className="form-control my-3" name={`quantity-for-item-${item}`} id={item} ref={newRef} onChange={(e) => setItemQuantity(item, e.target.value)}>
            {Array.from({length: cartDetails[item].max}, (x, i) => i + 1).map((option, index) => <option key={index}>{option}</option>)}
          </select>
      }
    })
    setSelects(tempSelects)
    madeSelects = true
  }

  function updateQuantity() { // error if refs do not get assigned before this is called
    refs.forEach(ref => {
      Object.keys(cartDetails).map(item => {
        if (ref.current.id === item) {
          // console.log('updating select with found quantity', ref.current.value, ' => ', cartDetails[item].quantity)
          ref.current.value = cartDetails[item].quantity
        }
      })
    })
  }

  useEffect(() => {
    if (!madeSelects) {
      if (!isSimple) {
        if (cartCount) {
          genSelects()
        }
      }
    }
  }, [])
  
  useEffect(() => {
    if (refs[0]) {
      if (refs[0].current) {
        updateQuantity()
      }
    }
  }, [refs[0]])
  
  return (
    <div>
      {Object.keys(cartDetails).length === 0 && <h1 className="my-5">🛒 No items found. Please go to <a href="/browse/1">Browse</a> and pick some up</h1>}
      {Object.keys(cartDetails).map(item => (
        <Card className="my-1 p-3" key={item}>
          {!isSimple && <X className="x-icon" onClick={() => removeItem(item)} style={{position: 'absolute', right: '10px', top: '10px'}} size={42}/>}
          <h4>{cartDetails[item].name}</h4>
          <Row>
            <Col sm={6} className="px-0">
              <BoxImg cartDetails={cartDetails} item={item} />
            </Col>
            <Col className="my-auto" sm={6}>
              {isSimple
                ? <Row className="text-muted">
                    <Col>Quantity</Col>
                    <Col className="text-right">{cartDetails[item].quantity} x</Col>
                  </Row>
                : refs[0] !== undefined
                  ? <Row>
                      <Col className="my-auto">
                        <h5 className="d-inline">{usd(cartDetails[item].price)}</h5>
                        <X className="float-right" size={27}/>
                      </Col>
                      <Col>{selects[item]}</Col>
                    </Row>
                  : <Spinner animation="border" variant="info" />
              }
              <hr />
              <Row className="text-muted">
                <Col>Subtotal</Col>
                <Col className="text-right">{cartDetails[item].formattedValue}</Col>
              </Row>
            </Col>
          </Row>
        </Card>
      ))}
    </div>
  )
}
