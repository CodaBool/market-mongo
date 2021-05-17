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
        <p>amount: ${usd(order.amount_received)}</p>
      </Card>
    </>
  )
}
