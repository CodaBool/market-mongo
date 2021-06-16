import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import { CaretLeft, ArrowLeft } from 'react-bootstrap-icons'
import { usd } from '../constants'
import { format } from 'timeago.js'

export default function Order({ order, setOrderData }) {
  return (
    <>
      <Button variant="light" className="rounded-circle my-5 border" onClick={() => setOrderData()} style={{width: '3rem', height: '3rem'}}>
        <ArrowLeft className="mb-1" size={18} />
      </Button>
      <Card className="p-3 my-3 rounded shadow">
        <h4>order: {order._id}</h4>
        <p>payment vendor: {order.vendor}</p>
        <p>status: <span className={`${order.status === 'complete' ? 'text-success': 'test-primary'}`}>{order.status}</span></p>
        <p>amount: ${usd(order.amount)}</p>
        <p>created: {format(order.createdAt)}</p>
        <p>updated: {format(order.updatedAt)}</p>
      </Card>
    </>
  )
}
