import Card from 'react-bootstrap/Card'
import { ArrowLeft, CaretLeft } from 'react-bootstrap-icons'
import { usd } from '../constants'

export default function Order({ order, setOrderData }) {
  return (
    <>
      <div style={{cursor: 'pointer'}} className="my-3" onClick={() => setOrderData()}>
        <CaretLeft className="mb-3" size={38}/> <h2 className="d-inline">Back</h2>
      </div>
      <Card className="p-3 my-3 rounded shadow">
        <h4>order: {order._id}</h4>
        <p>payment vendor: {order.vendor}</p>
        <p>status: <span className={`${order.status === 'complete' ? 'text-success': 'test-primary'}`}>{order.status}</span></p>
        <p>amount: ${usd(order.amount)}</p>
      </Card>
    </>
  )
}
