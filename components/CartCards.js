import React, { useState, useEffect, createRef } from 'react'
import { useShoppingCart } from 'use-shopping-cart'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import { X } from 'react-bootstrap-icons'
import BoxImg from './UI/BoxImg'

const QuanSelect = React.forwardRef(({ id, value, onSelect, quantity }, ref) => (
  <select className="form-control my-3" name={`sel-${id}`} id={id} value={value} ref={ref} onChange={onSelect}>
    {Array.from({length: Number(quantity)}, (x, i) => i + 1).map((option, index) => <option key={index}>{option}</option>)}
  </select>
))

export default function CartCards({ simple }) {
  const { cartDetails: cart, removeItem, cartCount, setItemQuantity } = useShoppingCart()
  const [selects, setSelects] = useState()

  useEffect(() => {
    if (cart) {
      setSelects(Object.keys(cart).map(item => {
        return (
          <QuanSelect
            quantity={cart[item].max} // max quantity
            value={cart[item].quantity}
            id={item} 
            ref={createRef()}
            onSelect={(e) => setItemQuantity(item, Number(e.target.value))} 
          />
        )
      }))
    }
  }, [cart])
  
  return (
    <>
      {Object.keys(cart).length === 0 && <h1 className="my-5">🛒 No items found. Please go to <a href="/browse/1">Browse</a> and pick some up</h1>}
      {Object.keys(cart).map((item, index) => (
        <Card className="my-1 p-3" key={item}>
          {!simple && <X className="x-icon" onClick={() => removeItem(item)} style={{position: 'absolute', right: '10px', top: '10px'}} size={42}/>}
          <h4>{cart[item].name}</h4>
          <Row>
            <Col sm={6} className="px-0">
              <BoxImg imageUrl={cart[item].image} alt={cart[item].name} small />
            </Col>
            <Col className="my-auto" sm={6}>
              {simple && 
                <>
                  <Row className="text-muted mt-3">
                    <Col>Price</Col>
                    <Col className="text-right">{cart[item].formattedValue}</Col>
                  </Row>
                  <Row className="text-muted">
                    <Col>Quantity</Col>
                    <Col className="text-right">x {cart[item].quantity}</Col>
                  </Row>
                </>
              }
              {(selects && !simple) && 
                <Row>
                  <Col className="my-auto">
                    <h5 className="d-inline">{cart[item].formattedValue}</h5>
                    <X className="float-right" size={27}/>
                  </Col>
                  <Col>{selects[index]}</Col>
                </Row>
              }
              <hr />
              <Row className="text-muted">
                <Col>Subtotal</Col>
                <Col className="text-right">{cart[item].formattedValue}</Col>
              </Row>
            </Col>
          </Row>
        </Card>
      ))}
    </>
  )
}
