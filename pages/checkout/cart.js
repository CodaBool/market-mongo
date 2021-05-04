import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import { useSession } from 'coda-auth/client'
import Button from 'react-bootstrap/Button'
import { useShoppingCart } from 'use-shopping-cart'
import { useRouter } from 'next/router'
import { BoxSeam } from 'react-bootstrap-icons'
import useScreen from '../../constants/useScreen'
import CartCards from '../../components/CartCards'

export default function Cart() {
  const { cartDetails: cart, formattedTotalPrice } = useShoppingCart()
  const router = useRouter()
  const [session, loading] = useSession()
  const size = useScreen()

  return (
    <>
      <Col className={`mx-auto shrink ${size == 'small' || size == 'xsmall' || size == 'medium' ? 'w-100' : 'w-50'}`}>
        <h1 className="display-3">Cart</h1>
        <CartCards size={size} />
        {Object.keys(cart).length > 0 &&
          <>
            <Card className="p-3 mt-4">
              <Row>
                <Col><h3 className="shrink">Total</h3></Col>
                <Col className="text-right"><h3>{formattedTotalPrice}</h3></Col>
              </Row>
            </Card>
            <Row>
              <Button className="w-100 mx-3 my-5" variant="primary" onClick={() => router.push('/checkout/combined')}>
                Add Shipping <BoxSeam className="ml-2 mb-1" size={14}/>
              </Button>
            </Row>
          </>
        }
      </Col>
    </>
  )
}