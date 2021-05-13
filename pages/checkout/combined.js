import { useState, useRef, useEffect } from 'react'
import { useSession, getSession, signIn } from 'coda-auth/client'
import { Cart3, PencilFill, BoxSeam, Envelope, Receipt, HandIndexThumb, PlusCircle, Plus } from 'react-bootstrap-icons'
import { useRouter } from 'next/router'
import { useShoppingCart } from 'use-shopping-cart'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import InputGroup from 'react-bootstrap/InputGroup'
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'
import { SHIPPING_COST, SHIPPING_EST } from '../../constants'
import useScreen from '../../constants/useScreen'
import Shipping from '../../components/Form/Shipping'
import Payment from '../../components/Form/Payment'
import CartCards from '../../components/CartCards'
import { Load } from '../../components/Load'

// Combined shipping and payment page to reduce the number of Stripe api reads for customer 
export default function Combined(props) {
  const { cartDetails: cart, totalPrice } = useShoppingCart()
  const total = '$ ' + ((totalPrice + (SHIPPING_COST * 100)) / 100).toFixed(2)
  const [customer, setCustomer] = useState(props.customer)
  const [page, setPage] = useState('shipping')
  const [session, loading] = useSession()
  const router = useRouter()
  const size = useScreen()

  if (session === null && !loading) {
    signIn()
    return <h1 className="display-4 my-5 text-center">Please Login</h1>
  }

  if (page === 'shipping') return <Ship customer={customer} size={size} router={router} setPage={setPage} total={total} setCustomer={setCustomer} />
  if (page === 'payment') return <Pay customer={customer} size={size} router={router} setPage={setPage} total={total} cart={cart} />
  return <h1 className="display-4 my-5 text-center">Please Reload</h1>
}

function Ship({ customer, size, setPage, router, total, setCustomer }) {
  const [loadMsg, setLoadMsg] = useState('')
  const scroll = () => { top.current && top.current.scrollIntoView() }
  const top = useRef(null)

  return (
    <Row ref={top}>
      <Col className={`${size.includes('small') ? 'mx-3 p-0 mt-3' : 'border-right pr-5 mt-3'}`} md={6}>
        <Cart3 className="mr-3 mb-3 d-inline" size={32} />
        <h1 className="display-4 d-inline" style={{fontSize: '2.5em'}}>Verify Cart</h1>
        <CartCards simple />
        <Card className="p-3">
          <Row>
            <Col className="text-muted">Tax</Col>
            <Col className="text-right text-muted">$ 0.00</Col>
          </Row>
          <Row>
            <Col className="text-muted">Shipping</Col>
            <Col className="text-right text-muted">$ {SHIPPING_COST}</Col>
          </Row>
          <Row>
            <Col>Total</Col>
            <Col className="text-right">{total}</Col>
          </Row>
        </Card>
        <Row>
          <Button className="w-100 m-3" variant="warning" onClick={() => router.push('/checkout/cart')}>Edit Cart <PencilFill className="ml-2 mb-1" size={14} /></Button>
        </Row>
      </Col >
      <Col className={`${size.includes('small') ? 'mx-3 p-0 mt-3' : 'border-left pl-5 mt-3'}`} md={6}>
        {loadMsg
          ? <Load msg={loadMsg} />
          : <Shipping customer={customer} scroll={scroll} setLoadMsg={setLoadMsg} size={size} shipping={customer.shipping} setPage={setPage} setCustomer={setCustomer} />
        }
      </Col>
    </Row>
  )
}

function Pay({ customer, size, router, setPage, total, cart }) {
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)
  const [loadMsg, setLoadMsg] = useState('')
  const top = useRef(null)

  useEffect(() => setShow(true), [])
  const scroll = () => top.current && top.current.scrollIntoView()

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
                : <Load msg="Address Not Found, Please Go Back and Re-enter Your Address" />
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
                      Click to Show More<HandIndexThumb className="sway" style={{marginLeft: '15px', marginBottom: '4px'}} size={20}/>
                    </p>
                  </Accordion.Toggle>
                  <Accordion.Collapse eventKey="0">
                    <CartCards simple />
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
                <Col className="text-right">{total}</Col>
              </Row>
            </>
          </Card>

          <Row>
            <Button className="w-100 m-3" variant="warning" onClick={() => setPage('shipping')}>Edit Shipping <PencilFill className="ml-2 mb-1" size={14} /></Button>
          </Row>
        </>
          }
        </Col >
        <Col className={`${size.includes('small') ? 'mx-3 p-0 mt-3' : 'border-left pl-5 mt-3'}`} md={6}>
          <Payment size={size} customer={customer} setError={setError} setPage={setPage} setLoadMsg={setLoadMsg} scroll={scroll} router={router} total={total} cart={cart} />
          {error && <p>{error}</p>}
          <Row>
            <Button className="w-100 m-3" variant="info" onClick={() => setShow(true)}>Click For Help</Button>
          </Row>
        </Col>
      </Row>

      {/* Modal informing about test payment info */}
      {/* <Modal show={show} onHide={() => setShow(false)}>
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
      </Modal > */}
    </>
  )
}

export async function getServerSideProps(context) {
  const stripe = require('stripe')(process.env.STRIPE_SK)
  const session = await getSession(context)
  if (!session?.customerId) return { props: {  } } 
  const customer = await stripe.customers.retrieve(session.customerId)
  return { props: { customer } }
}