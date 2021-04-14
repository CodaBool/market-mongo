/* Youtube Guide @Link https://www.youtube.com/watch?v=szRNm8mDrNY */
import React, { useState, useEffect, useRef } from 'react'
// import Stripe from 'stripe'
// import { loadStripe } from '@stripe/stripe-js'
// import { Elements } from '@stripe/react-stripe-js'
import PaymentForm from '../../components/PaymentForm'
import { useSession } from 'next-auth/client'
import CartCards from '../../components/CartCards'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import InputGroup from 'react-bootstrap/InputGroup'
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'
import { Cart3, PencilFill, BoxSeam, Envelope, Receipt, HandIndexThumb, PlusCircle, Plus } from 'react-bootstrap-icons'
import { axios, SHIPPING_COST, SHIPPING_EST, getEmail, getId } from '../../constants'
import { useRouter } from 'next/router'
import useScreen from '../../components/useScreen'
import { Load, isLoad } from '../../components/Load'
import { quickCustomer } from '../../lib/helper'

export async function getServerSideProps(context) {
  const customer = await quickCustomer(null, context)
  return { props: { customer } }
}

export default function CheckoutPage({ customer }) {
  const [session, loading] = useSession()
  const [price, setPrice] = useState(-1)
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)
  const [loadMsg, setLoadMsg] = useState('')
  const router = useRouter()
  const top = useRef(null)
  var size = useScreen()

  useEffect(() => setShow(true), [])
  const scroll = () => top.current && top.current.scrollIntoView()
  
  if (isLoad(session, loading, true)) return <Load />

  if (!size) size = 'medium'

  return (
    <>
      <Row ref={top}>
        <Col className={`${size.includes('small') ? 'mx-3 p-0 mt-3' : 'border-right pr-5 mt-3'}`} md={6}>
          {loadMsg ? <Load msg={loadMsg} />
          : <>
          <BoxSeam className="mr-3 mb-3 d-inline" size={32} />
          <h1 className="display-4 d-inline" style={{fontSize: '2.5em'}}>Shipping</h1>
          <Card className="mb-3">
            <Card.Body>
              {customer.shipping ?
                <>
                <h2 style={{fontWeight: '20'}}>Address</h2>
                <Card className="my-2 p-3">
                  <p>{customer.shipping.name}</p>
                  <p>{customer.shipping.address.line1}</p>
                  {customer.shipping.address.line2 && <p>{customer.shipping.address.line2}</p>}
                  <p>{customer.shipping.address.city} {customer.shipping.address.state}, {customer.shipping.address.postal_code}</p>
                </Card>
                <Card className="my-2 p-3">
                  <p>$ {SHIPPING_COST} USPS Priority Mail</p>
                  <InputGroup.Text>
                    <Envelope style={{marginRight: '15px'}} size={22}/>{SHIPPING_EST}
                  </InputGroup.Text>
                </Card>
                </>
                : <Load />
              }
            </Card.Body>
          </Card>

          <Receipt className="mr-3 mb-3 d-inline" size={32} />
          <h1 className="display-4 d-inline" style={{fontSize: '2.5em'}}>Order</h1>
          <Card className="p-3">
            <>
              <Accordion>
                <Card>
                  <Accordion.Toggle as={Card.Header} eventKey="0" className="colorless">
                    <h4 className="d-inline" style={{fontWeight: '20'}}>
                      <PlusCircle style={{marginRight: '15px', marginBottom: '5px'}} size={20}/>Details
                    </h4>
                    <p className="float-right" style={{fontSize: '0.8em'}}>
                      Click to Show More<HandIndexThumb className="translating" style={{marginLeft: '15px', marginBottom: '4px'}} size={20}/>
                    </p>
                  </Accordion.Toggle>
                  <Accordion.Collapse eventKey="0">
                    <CartCards isSimple/>
                  </Accordion.Collapse>
                </Card>
              </Accordion>
              <Row className="mt-2">
                <Col className="text-muted">Tax</Col>
                <Col className="text-right text-muted">$ 0.00</Col>
              </Row>
              <Row>
                <Col className="text-muted">Shipping</Col>
                <Col className="text-right text-muted">$ {SHIPPING_COST}</Col>
              </Row>
              <Row>
                <Col>Total</Col>
                <Col className="text-right">{price}</Col>
              </Row>
            </>
          </Card>

          <Row>
            <Button className="w-100 m-3" variant="warning" onClick={() => router.push('/checkout/shipping')}>Edit Shipping <PencilFill className="ml-2 mb-1" size={14} /></Button>
          </Row>
        </>
          }
        </Col >
        <Col className={`${size.includes('small') ? 'mx-3 p-0 mt-3' : 'border-left pl-5 mt-3'}`} md={6}>
          <PaymentForm size={size} session={session} customer={customer} setError={setError} setPrice={setPrice} setLoadMsg={setLoadMsg} scroll={scroll}/>
          {error && <p>{error}</p>}
          <Row>
            <Button className="w-100 m-3" variant="info" onClick={() => setShow(true)}>Click For Help</Button>
          </Row>
        </Col>
      </Row>

      {/* Modal informing about test payment info */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Welcome to the Test Environment!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Card Number = 4242 4242 4242 4242</p>
          <p>Expiration = 0424</p>
          <p>CVC = 424</p>
        </Modal.Body>
        <Modal.Footer>
          <p>This is just a test and no actual charges are made. Try making a test payment with the Stripe card info found above.</p>
        </Modal.Footer>
      </Modal >
    </>
  )
}