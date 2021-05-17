import { useState, useRef, useEffect } from 'react'
import { useSession, getSession, signIn } from 'coda-auth/client'
import { Cart3, PencilFill, BoxSeam, Envelope, Receipt, HandIndexThumb, PlusCircle, Plus, CreditCard } from 'react-bootstrap-icons'
import { useRouter } from 'next/router'
import { useShoppingCart } from 'use-shopping-cart'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import InputGroup from 'react-bootstrap/InputGroup'
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'
import axios from 'axios'
import { loadStripe } from '@stripe/stripe-js'
import { PayPalButton } from "react-paypal-button-v2"
import { SHIPPING_COST, SHIPPING_EST } from '../../constants'
import useScreen from '../../constants/useScreen'
import Shipping from '../../components/Form/Shipping'
import Payment from '../../components/Form/Payment'
import CartCards from '../../components/CartCards'
import { Load, isLoad } from '../../components/Load'
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK)



export default function Combined() {
  const { cartDetails, totalPrice } = useShoppingCart()
  const total = '$ ' + ((totalPrice + (SHIPPING_COST * 100)) / 100).toFixed(2)
  const [session, loading] = useSession()
  const router = useRouter()
  const size = useScreen()
  const [payError, setPayError] = useState('')
  const [show, setShow] = useState(false)
  const [showError, setShowError] = useState(false)
  const [loadMsg, setLoadMsg] = useState('')
  const top = useRef(null)

  if (isLoad(session, loading, true)) return <Load />

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
              <Button className="w-100 m-3" variant="warning" onClick={() => router.push('/checkout/cart')}>Edit Shipping <PencilFill className="ml-2 mb-1" size={14} /></Button>
            </Row>
          </>
        </Col>
        <Col className={`${size.includes('small') ? 'mx-3 p-0 mt-3' : 'border-left pl-5 mt-3'}`} md={6}>
          {/* {orderID
            ? <Load msg="Order Complete" />
            : <>
                <Stripe cart={cartDetails} />
                <PayPal price={totalPrice} cart={cartDetails} setOrderID={setOrderID} setPayError={setPayError} setShowError={setShowError} />
              </>
          } */}
          <>
            <Stripe cart={cartDetails} />
            <PayPal price={totalPrice} cart={cartDetails} router={router} setPayError={setPayError} setShowError={setShowError} />
          </>
          {/* {error && <p>{error}</p>} */}
          <Row className="mt-4">
            <Button className="mx-auto my-5" variant="link" onClick={() => setShow(true)}>Help</Button>
          </Row>
        </Col>
      </Row>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Make a Secure Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Stripe</strong>: Established in 2009 has quickly become a trusted payment processor with over .5B in revenue. 90% of Americans have bought from businesses using Stripe such as Amazon, Google, Lyft and Zoom. There are about 2 million active accounts</p>
          <p><strong>PayPal</strong>: Established in 1998 and soon founded by Elon Musk, Paypal generates over 18B in revenue. There are over 350 million active accounts</p>
        </Modal.Body>
        <Modal.Footer>
          <p className="text-muted">Transactions are handled entirely through either <strong>Stripe</strong> or <strong>PayPal</strong> and no detailed card information is stored or read by this application.</p>
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

function PayPal({ price, setPayError, setShowError, cart, router }) {
  const amount = String(price).slice(0, -2) + '.' + String(price).slice(-2)

  return (
    <div className="w-100" style={{position: 'relative'}}>
      <div className="paypal-skeleton rounded w-100"></div>
      <div className="paypal-container">
        <PayPalButton
          amount={amount}
          currency="USD"
          shippingPreference="GET_FROM_FILE" // default is "NO_SHIPPING"
          createOrder={() => (          
            axios.post('/api/paypal/order', cart)
              .then(res => res.data.result.id)
              .catch(err => console.log(err.response.data.msg))
          )}
          onApprove={data => {
            axios.post('/api/paypal/order', data)
              .then(res => {
                console.log(res.data)
                if (res.data.status === 'COMPLETED') {
                  router.push(`/checkout/confirmed?orderID=${res.data._id}`)
                }
              })
              .catch(err => {
                console.log(err)
                setPayError(`${err.response.data.msg} ${err.response.status}`)
                setShowError(true)
              })
              .catch(console.log)
          }}
          onShippingChange={(data, actions) => {
            console.log('shipping', data, actions)
            // axios.put('/api/user', data)
            //   .then(res => console.log(res.data))
            //   .catch(err => console.log(err.response.data.msg))
          }}
          style={{
            color: 'silver',
            shape: 'rect',
            tagline: false,
            layout:  'horizontal',
            height: 55
          }}
          catchError={err => console.log('catchError', err)}
          onError={err => {
            if (err.message === 'Expected an order id to be passed') {
              console.log('cannot create order')
            } else {
              console.log('new error', err.message)
              console.log('CREATE AN IF FOR THIS')
            }
          }}
          onCancel={err => console.log('onCancel', err)}
          options={{
            clientId: process.env.NEXT_PUBLIC_PAYPAL_ID,
            disableFunding: 'paylater,bancontact,blik,eps,giropay,ideal,mercadopago,mybank,p24,sepa,sofort',
            vault: false,
            commit: true,
          }}
        />
      </div>
    </div>
  )
}

function Stripe({ cart }) {
  async function checkout() {
    let sessionId = null
    const stripe = await stripePromise
    console.log('cart', cart)
    await axios.post('/api/stripe/session', cart)
      .then(res => {
        console.log('res', res.data)
        sessionId = res.data.id
      })
      .catch(err => console.log('err', err.response.data.msg))
      .catch(console.log)
    if (!sessionId) return
    const result = await stripe.redirectToCheckout({sessionId});
    console.log('done', result)
    if (result.error) {
      console.error(result.error)
    }
  }

  return (
    <button onClick={checkout} className="mx-auto w-100 my-5 stripeButton rounded" size="lg">
      <CreditCard style={{color: '#2f4457', marginBottom: '4px'}} size={28}/> Stripe
    </button>
  )
}

// export async function getServerSideProps(context) {
//   const stripe = require('stripe')(process.env.STRIPE_SK)
//   const session = await getSession(context)
//   if (!session?.customerId) return { props: {  } } 
//   const customer = await stripe.customers.retrieve(session.customerId)
//   return { props: {  } }
// }