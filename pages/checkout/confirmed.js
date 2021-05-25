// import React, { useState, useEffect, useRef } from 'react'
// import { useSession, signIn } from 'coda-auth/client'
// import Button from 'react-bootstrap/Button'
// import Row from 'react-bootstrap/Row'
// import Accordion from 'react-bootstrap/Accordion'
// import Card from 'react-bootstrap/Card'
// import Col from 'react-bootstrap/Col'
// import Form from 'react-bootstrap/Form'
// import InputGroup from 'react-bootstrap/InputGroup'
// import { PencilFill, BoxSeam, Envelope, Receipt, HandIndexThumb, PlusCircle, Plus } from 'react-bootstrap-icons'
// import { useRouter } from 'next/router'
// import { useShoppingCart } from 'use-shopping-cart'
// import CartCards from '../../components/CartCards'
// import useScreen from '../../constants/useScreen'
// import { Load, isLoad } from '../../components/Load'
// import { axios, SHIPPING_COST, SHIPPING_EST, getEmail, getId } from '../../constants'

// export async function getServerSideProps(context) {
//   const stripe = require('stripe')(process.env.STRIPE_SK)
//   let intent = {}
//   const paymentIntent = await stripe.paymentIntents.retrieve(context.query.payment_intent)
//   if (paymentIntent) {
//     intent = paymentIntent
//   } else {
//     console.log('no intent by id', context.query.payment_intent)
//   }
//   return { props: { intent } }
// }
  
// export default function Confirmed({ intent }) {
//   const { cartDetails, formattedTotalPrice } = useShoppingCart()
//   const [session, loading] = useSession()
//   const [price, setPrice] = useState(-1)
//   const [error, setError] = useState('')
//   const router = useRouter()
//   const note = useRef(null)
//   var size = useScreen()
//   if (!size) size = 'medium'
//   console.log('intent, on client', intent)
//   if (isLoad(session, loading, true)) return <Load />

//   function sendNote() {
//     if (note.current.value.trim()) {
//       console.log('send note:', note.current.value)
//     } else {
//       console.log('note is empty')
//     }
//   }

//   return (
//     <>
//       <h1 className="display-3">Order Complete</h1>
//       <Row>
//         <Col className={`mt-5 ${!size.includes('small') && 'border-right pr-5'}`} md={6}>
//           <>
//             <BoxSeam className="mr-3 mb-3 d-inline" size={32} />
//             <h1 className="display-4 d-inline" style={{fontSize: '2.5em'}}>Shipping</h1>
//             <Card className="mb-3">
//               <Card.Body>
//                 {intent.shipping ?
//                   <>
//                   <h2 style={{fontWeight: '20'}}>Address</h2>
//                   <Card className="my-3 p-3">
//                     <p>{session.user.name}</p>
//                     <p>{intent.shipping.address.line1}</p>
//                     {intent.shipping.address.line2 && <p>{intent.shipping.address.line2}</p>}
//                     <p>{intent.shipping.address.city} {intent.shipping.address.state}, {intent.shipping.address.postal_code}</p>

//                     <InputGroup.Text>
//                       <Envelope style={{marginRight: '15px'}} size={22}/>{SHIPPING_EST}
//                     </InputGroup.Text>
//                     <p className="text-center mt-1 text-muted">USPS Priority Mail</p>
//                   </Card>
//                   <h3 style={{fontWeight: '20'}} className="text-muted">Note To Seller</h3>
//                   <Card>
//                     <Form.Control 
//                       as="textarea"
//                       rows="1"
//                       placeholder="Optional requests?"
//                       ref={note}
//                     />
//                     <Row>
//                       <Button className="w-100 m-3" variant="outline-primary" onClick={sendNote}>Send Note</Button>
//                     </Row>
//                   </Card>
//                   </>
//                   : <Load />
//                 }
//               </Card.Body>
//             </Card>
//           </>
//         </Col>
//         <Col className={`mt-5 ${!size.includes('small') && 'border-left pl-5'}`} md={6}>
//           <>
//             <Receipt className="mr-3 mb-3 d-inline" size={32} />
//             <h1 className="display-4 d-inline" style={{fontSize: '2.5em'}}>Order</h1>
//             <Card className="p-3">
//               <>
//                 <Accordion>
//                   <Card>
//                     <Accordion.Toggle as={Card.Header} eventKey="0" className="colorless">
//                       <h4 className="d-inline" style={{fontWeight: '20'}}>
//                         <PlusCircle style={{marginRight: '15px', marginBottom: '5px'}} size={20}/>Details
//                       </h4>
//                       <p className="float-right" style={{fontSize: '0.8em'}}>
//                         Click to Show More<HandIndexThumb className="translating" style={{marginLeft: '15px', marginBottom: '4px'}} size={20}/>
//                       </p>
//                     </Accordion.Toggle>
//                     <Accordion.Collapse eventKey="0">
//                       {/* TODO: store order and retrieve it from stripe */}
//                       <CartCards isSimple/>
//                     </Accordion.Collapse>
//                   </Card>
//                 </Accordion>
//                 {/* need to format in oneline when small display */}
//                 <Card className="p-3">
//                   <Row className="mt-2">
//                     <Col>Order ID:</Col>
//                     <Col className="text-right">{intent.id}</Col>  
//                   </Row>
//                   <Row className="mt-2">
//                     <Col>Receipt Emailed To: </Col>
//                     <Col className="text-right">{intent.receipt_email}</Col>  
//                   </Row>
//                   <Row className="mt-2">
//                     <Col>Created: </Col>
//                     <Col className="text-right">{new Date(intent.created * 1000).toLocaleString('en-US')}</Col>  
//                   </Row>
//                   <Row className="mt-2">
//                     <Col>Total</Col>
//                     <Col className="text-right">$ {(intent.amount_received / 100).toFixed(2)}</Col>  
//                   </Row>
//                 </Card>
//               </>
//             </Card>
//           </>
//         </Col>
//       </Row>
//     </>
//   )
// }


// /* Map Making

//   function handleClick() {
//     const params = {
//       apiKey: process.env.NEXT_PUBLIC_HERE_API_KEY,
//       q: '3126 san leo drive'
//     }
//     // params['locationId'] = this.state.locationId;
//     axios.get('https://geocode.search.hereapi.com/v1/geocode', { params: params })
//       .then(res => {
//         console.log(res.data.items[0])

//         console.log('House Number', res.data.items[0].address.houseNumber)
//         console.log('Street', res.data.items[0].address.street)
//         console.log('Zipcode', res.data.items[0].address.postalCode)
//         console.log('City', res.data.items[0].address.city)
//         console.log('State', res.data.items[0].address.stateCode)
//       })
//       .catch(err => {
//         console.log(err)
//       })

//     // at=52.5228,13.4124
//     // q=petrol+station
//     // limit=1
//     // in=countryCode%3AUSA
//     // city=Berlin;country=Germany;street=Friedrichstr;houseNumber=20
//     // [country, state, county, city, district, street,  houseNumber, postalCode]
//   }

//   function specificSearch() {
//     const city = 'Orlando'
//     const street = 'San Leo Dr'
//     const houseNumber = '3126'
//     const postalCode = '32820'
//     const state = 'Florida'

//     const params = {
//       apiKey: process.env.NEXT_PUBLIC_HERE_API_KEY,
//       qq: `city=${city};street=${street};houseNumber=${houseNumber};postalCode=${postalCode};state=${state}`,
//       in: 'countryCode:USA'
//     }

//     axios.get('https://geocode.search.hereapi.com/v1/geocode', { params: params })
//       .then(res => {
//         console.log(res)
//       })
//       .catch(err => {
//         console.log(err)
//       })
//   }

//   function closeToReal() {
//     const street = 'San Leo Dr'
//     const houseNumber = '3126'

//     const params = {
//       apiKey: process.env.NEXT_PUBLIC_HERE_API_KEY,
//       qq: `street=${street};houseNumber=${houseNumber}`,
//       in: 'countryCode:USA'
//     }
    
//     axios.get('https://geocode.search.hereapi.com/v1/geocode', { params: params })
//       .then(res => {
//         console.log(res)
//       })
//       .catch(err => {
//         console.log(err)
//       })
//   }

//   function makeMap() {
//     const city = 'Orlando'
//     const street = 'San Leo Dr'
//     const houseNumber = '3126'
//     const postalCode = '32820'

//     const params = {
//       n: houseNumber, // house number
//       s: street, // street
//       ci: city, // city
//       zi: postalCode, // zip
//     }

//     axios.get('/api/here/getImage', { params: params })
//       .then(res => {
//         console.log(res.data)
//       })
//       .catch(err => {
//         console.log(err)
//       })
//   }
// */

// REWRITE v2
import { usd } from '../../constants'
import { useEffect } from 'react'
import axios from 'axios'
// import { useRouter } from 'next/router'

// server
import { Order } from '../../models'
import { getSession } from 'coda-auth/client'
import { connectDB, jparse } from '../../util/db'

export default function confirmed({ order, id }) {
  // const router = useRouter()
  useEffect(() => {
    // setTimeout(() => {
    //   let api = '/api/order'
    //   axios.get('/')
    //   // console.log('paypal', router.query.orderID)
    //   // console.log('stripe', router.query.id)
    //   console.log('check')
    // }, 5000)
  }, [])

  // console.log('client order', order)

  if (!order) return <h1 className="my-5 display-4">Could Not Display Order</h1>
  return (
    <>
      <h1 className="display-3 my-4">
        Order Complete
      </h1>
      <p>Payment Vendor: {order.vendor}</p>
      <p>Amount: {usd(order.amount)}</p>
      <p>Currency: {order.currency}</p>
      <p>Status: {order.status}</p>
      <p>Name: {order.shipping?.name}</p>
      <div>Address: {Object.keys(order.shipping?.address || {}).map((el, index) => {
          return (
            <div key={index} className="ml-4" style={{lineHeight: '.7'}}>
              <br/>
              {`${el}: ${order.shipping.address[el]}`}
            </div>
          )
        })}
      </div>
    </>
  )
}

export async function getServerSideProps(context) {
  try {
    // console.log('\n=========== Confirmed ============')
    const jwt = await getSession(context)
    const id = context.query.id
    let ip = context.req.socket?.remoteAddress || context.req.headers['x-forwarded-for']
    // console.log('can i get an ip =', ip) // working on dev.
    if (!jwt) throw `Unauthorized: ${id} | ${ip}`
    await connectDB()
    let order = await Order.findById(id)
    if (!order) throw `Could not find order: ${id}`
    if (jwt.id === String(order.user)) {
      return { props: { order: jparse(order) } }
    }
  } catch (err) {
    console.log(err)
  }
  return { props: {} }
}