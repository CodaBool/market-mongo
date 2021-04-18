import React, { useState, useRef } from 'react'
import ShippingForm from '../../components/ShippingForm'
import { useSession } from 'coda-auth/client'
import CartCards from '../../components/CartCards'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import { Cart3, PencilFill } from 'react-bootstrap-icons'
import { SHIPPING_COST } from '../../constants'
import { useRouter } from 'next/router'
import { useShoppingCart } from 'use-shopping-cart'
import useScreen from '../../constants/useScreen'
import { getUserFromContext } from '../api/user'
import { Load } from '../../components/Load'

export default function CheckoutPage({ user }) {
  console.log('user', user)
  const { totalPrice } = useShoppingCart()
  const [session, loading] = useSession()
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadMsg, setLoadMsg] = useState('')
  const router = useRouter()
  var size = useScreen()
  const top = useRef(null)
  const scroll = () => {console.log('scrolling');top.current && top.current.scrollIntoView()}
  const total = '$ ' + ((totalPrice + (SHIPPING_COST * 100)) / 100).toFixed(2)
  
  if (!size) size = 'medium'

  return (
    <Row ref={top}>
      <Col className={`${size.includes('small') ? 'mx-3 p-0 mt-3' : 'border-right pr-5 mt-3'}`} md={6}>
        {loadMsg ? <Load msg={loadMsg} />
        : <>
          <Cart3 className="mr-3 mb-3 d-inline" size={32} />
          <h1 className="display-4 d-inline" style={{fontSize: '2.5em'}}>Verify Cart</h1>
          <CartCards isSimple />
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
        </>
        }
      </Col >
      <Col className={`${size.includes('small') ? 'mx-3 p-0 mt-3' : 'border-left pl-5 mt-3'}`} md={6}>
        {/* {saving
          ? <Load msg="Saving" />
          : <ShippingForm user={user} scroll={scroll} setLoadMsg={setLoadMsg} size={size} session={session} />
        } */}
        {error && <p className="mx-auto">{error}</p>}
      </Col>
    </Row>
  )
}

export async function getServerSideProps(context) {
  const user = await getUserFromContext(context)
  return { props: { user: JSON.parse(JSON.stringify(user)) } }
}