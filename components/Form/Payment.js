import { useState, useEffect }  from 'react'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Accordion from 'react-bootstrap/Accordion'
import Popover from 'react-bootstrap/Popover'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import { CreditCard, BagCheckFill, PlusCircle, InfoCircle, HandIndexThumb } from 'react-bootstrap-icons'
// import { useRouter } from 'next/router'
// import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement} from '@stripe/react-stripe-js'
import { useForm } from 'react-hook-form'
import { loadStripe } from '@stripe/stripe-js'
import axios from 'axios'
// import { SHIPPING_COST, getState } from '../constants'
import Image from 'next/image'
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK)

const popover = (
  <Popover>
    <Popover.Title as="h3">The CVC is the 3 digit number usually located on the back of the card.</Popover.Title>
    <Popover.Content>
      <Image src="/image/cvc.png" width={260} height={150} layout="responsive" alt="cvc" />
    </Popover.Content>
  </Popover>
)
const popoverStripe = (
  <Popover>
    <Popover.Title as="h3">Stripe is a trusted payment service.</Popover.Title>
    <Popover.Content>
      To ensure security we complete checkouts with Stripe. Card information is handled entirely through Stripe, no card information is stored or even seen outside of Stripe. 90% of Americans have bought from businesses using Stripe such as Amazon, Google, Lyft and Zoom. 
    </Popover.Content>
  </Popover>
)

export default function PaymentForm({ size, customer, setLoadMsg, setPage, scroll, router, cart }) {
  // const { handleSubmit, watch, errors, register, control, getValues, setValue, formState, trigger } = useForm()
  // const [paymentComplete, setPaymentComplete] = useState(false)
  // const total = '$ ' + ((totalPrice + (SHIPPING_COST * 100)) / 100).toFixed(2)
  
  // useEffect(() => setPrice(total), [])
  // useEffect(() => autoFillState(watch('zip')), [watch])


  async function checkout() {
    scroll()
    let sessionId = null
    const stripe = await stripePromise;
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
      // If `redirectToCheckout` fails due to a browser or network
      // error, display the localized error message to your customer
      // using `result.error.message`.
    }
    // setLoadMsg('Finalizing Order')
    // router.push('/checkout/confirmed')
  }

  // const onSubmit = async (data) => {
  //   scroll()
  //   console.log('submitted payment | data =', data)
  //   await axios.post('/api/stripe/session', cart)
  //     .then(res => console.log('res', res.data))
  //     .catch(err => console.log('err', err.response.data.msg))
    // setLoadMsg('Creating Order')
    // await axios.get('/api/stripe/validateCart', { params: {cartDetails:cartDetails, customer:customer }})
    //   .then(res => {
    //     intent = res.data
    //   })
    //   .catch(err => {
    //     console.log(err)
    //     console.log(err.response.data)
    //     setError('Server Error, please try again later or contact support')
    //   })

    // let status = ''
    // if (Object.keys(intent).length > 0) {
    //   try {
    //     setLoadMsg('Finalizing Order')
    //     await stripe.confirmCardPayment(intent.client_secret, {
    //       payment_method: {
    //         card: elements.getElement(CardNumberElement)
    //       }})
    //       .then(res => {
    //         status = res.paymentIntent.status
    //       })
    //       .catch(err => {
    //         console.log(err)
    //       })
    //   } catch (err) {
    //     console.log(err.message)
    //   }
    // }
    // if (status == 'succeeded') {
    //   setLoadMsg('Order Successful')
    //   router.push({
    //     pathname: '/checkout/confirmed',
    //     query: { payment_intent: intent.id },
    //   })
    // }
  // }

  return (
    <Accordion>
      <Card>
        <Accordion.Toggle as={Card.Header}>
          Payment<CreditCard style={{marginLeft: '20px', marginBottom: '4px'}} size={28}/>
        </Accordion.Toggle>
        <Accordion.Collapse className="show">
          <Card.Body className="pt-0">
          <Form.Label>Card Number</Form.Label>
          <Form.Group className="border group">
            hi
            {/* <CardNumberElement onChange={checkPay} /> */}
          </Form.Group>
            <OverlayTrigger trigger={['hover', 'focus']} overlay={popoverStripe} >
              <Row>
                {/* <div className="mx-auto d-block">
                  <Image src="/image/poweredByStripe.jpg" className="rounded" width={140} height={40} alt="stripe" />
                </div> */}
              </Row>
            </OverlayTrigger>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
      <Button onClick={checkout}>Stripe Checkout</Button>
    </Accordion>
  )
}