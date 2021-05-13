import { useState } from 'react'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Button from 'react-bootstrap/Button'
import { useShoppingCart } from 'use-shopping-cart'
import { useRouter } from 'next/router'
import { useSession, signIn } from 'coda-auth/client'
import { BoxSeam } from 'react-bootstrap-icons'
import CartCards from '../../components/CartCards'
import { Load } from '../../components/Load'

export default function Cart() {
  const { cartDetails, formattedTotalPrice } = useShoppingCart()
  const [session, loading] = useSession()
  const [routing, setRouting] = useState()
  const router = useRouter()

  function handleClick() {
    setRouting(true)
    if (!session) {
      signIn()
      return
    }
    router.push('/checkout/combined')
  }

  return (
    <>
      <Col md={8} className="mx-auto">
        <h1 className="display-3">Cart</h1>
        <CartCards session={session} />
        {Object.keys(cartDetails).length > 0 &&
          <>
            <Card className="p-3 mt-4">
              <Row>
                <Col><h3 className="shrink">Total</h3></Col>
                <Col className="text-right"><h3>{formattedTotalPrice}</h3></Col>
              </Row>
            </Card>
            <Row>
              {routing
                ? <Load msg="Creating Checkout" />
                : <Button className="w-100 mx-3 my-5" variant="primary" disabled={loading} onClick={handleClick}>
                    Add Shipping <BoxSeam className="ml-2 mb-1" size={14}/>
                  </Button>
              }
            </Row>
          </>
        }
      </Col>
    </>
  )
}