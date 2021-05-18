import Card from 'react-bootstrap/Card'
import { ArrowLeft, CaretLeft } from 'react-bootstrap-icons'
import { usd } from '../constants'

export default function Order({ order, setOrderData }) {
  
  console.log(order)
  return (
    <>
      <div style={{cursor: 'pointer'}} className="border" onClick={() => setOrderData()}>
        <CaretLeft className="mb-3" size={38}/> <h2 className="d-inline">Back</h2>
      </div>
      <Card className="p-2 my-3">
        <h4>order: {order._id}</h4>
        <p>payment vendor: {order.vendor}</p>
        {order.payment_status === 'unpaid'
          ? <>
              <p>status: Processing</p>
              <p>amount: ${usd(order.amount_intent)}</p>
            </>
          : <>
              <p>status: {order.status}</p>
              <p>amount: ${usd(order.amount_received)}</p>
            </>
        }
      </Card>
    </>
  )
}
