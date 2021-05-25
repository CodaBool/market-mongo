import { useState, useRef } from 'react'
import { useSession } from 'coda-auth/client'
import { PencilFill, Receipt, HandIndexThumb, PlusCircle, CreditCard } from 'react-bootstrap-icons'
import { useRouter } from 'next/router'
import { useShoppingCart } from 'use-shopping-cart'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'
import axios from 'axios'
import { loadStripe } from '@stripe/stripe-js'
import { SHIPPING_COST } from '../../constants'
import useScreen from '../../constants/useScreen'
import CartCards from '../../components/CartCards'
import PayPalButton from '../../components/PayPalButton'
import { Load, isLoad } from '../../components/Load'
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK)

export default function Payment() {
  const { cartDetails, totalPrice } = useShoppingCart()
  const total = '$ ' + ((totalPrice + (SHIPPING_COST * 100)) / 100).toFixed(2)
  const [session, loading] = useSession()
  const router = useRouter()
  const size = useScreen()
  const [payError, setPayError] = useState('')
  const [show, setShow] = useState(false)
  const [showError, setShowError] = useState(false)
  const [showCred, setShowCred] = useState(true)
  const [loadMsg, setLoadMsg] = useState('')
  const top = useRef(null)

  if (isLoad(session, loading, true)) return <Load />

  async function stripeCheckout() {
    let sessionId = null
    const stripe = await stripePromise
    await axios.post('/api/stripe/session', cartDetails)
      .then(res => {
        console.log('res', res.data)
        sessionId = res.data.id
      })
      .catch(err => console.log('err', err.response.data.msg))
      .catch(console.log)
    if (!sessionId) return
    const result = await stripe.redirectToCheckout({sessionId})
    console.log('done', result)
    if (result.error) {
      console.error(result.error)
    }
  }

  return (
    <>
      <Row ref={top}>
        <Col className={`${size.includes('small') ? 'mx-3 p-0 mt-3' : 'border-right pr-5 mt-3'}`} md={6}>
          <>
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
              <Button className="w-100 m-3" variant="warning" onClick={() => router.push('/checkout/cart')}>Edit Cart <PencilFill className="ml-2 mb-1" size={14} /></Button>
            </Row>
          </>
        </Col>
        <Col className={`${size.includes('small') ? 'mx-3 p-0 mt-3' : 'border-left pl-5 mt-3'}`} md={6}>
          <>
            <button onClick={stripeCheckout} className="mx-auto w-100 my-5 stripeButton rounded" size="lg">
              <CreditCard style={{color: '#2f4457', marginBottom: '4px'}} size={28}/> Stripe
            </button>
            <PayPalButton setPayError={setPayError} setShowError={setShowError} />
          </>
          {/* {error && <p>{error}</p>} */}
          <Row className="mt-4">
            <Button className="mx-auto my-5" variant="link" onClick={() => setShow(true)}>Help</Button>
            <Button className="mx-auto my-5" variant="link" onClick={() => setShowCred(true)}>Payment Credentials</Button>
          </Row>
        </Col>
      </Row>

      {/* Modals */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Make a Secure Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Stripe</strong>: Established in 2009 has quickly become a trusted payment processor with over .5B in revenue. 90% of Americans have bought from businesses using Stripe such as Amazon, Google, Lyft and Zoom. There are about 2 million active accounts</p>
          <p><strong>PayPal</strong>: Established in 1998, Paypal generates over 18B in revenue. There are over 350 million active accounts</p>
        </Modal.Body>
        <Modal.Footer>
          <p className="text-muted">Transactions are handled entirely through either <strong>Stripe</strong> or <strong>PayPal</strong> and no detailed card information is stored or read by this application.</p>
        </Modal.Footer>
      </Modal>
      <Modal show={showCred} onHide={() => setShowCred(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Welcome to the devlopment environment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Stripe</h4>
          <p><strong>Card Numbers</strong>: 4242 4242 4242 4242</p>
          <p><strong>Expiration</strong>: 424</p>
          <p><strong>CVC</strong>: 424</p>
          <hr/>
          <br/>
          <h4>PayPal</h4>
          <p><strong>Email</strong>: sb-odshu6116493@personal.example.com</p>
          <p><strong>Password</strong>: {"1wK<1V0="}</p>
        </Modal.Body>
        <Modal.Footer>
          <p className="text-muted mx-auto">Please use the sandbox credentials to complete an order</p>
        </Modal.Footer>
      </Modal>
      <Modal show={showError} onHide={() => setShowError(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Something went wrong!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-danger">{payError.substring(0, payError.length - 3)}</p>
        </Modal.Body>
        <Modal.Footer>
          <p className="text-muted mx-auto">Code {payError.substring(payError.length - 3)}</p>
        </Modal.Footer>
      </Modal>
    </>
  )
}