import { useState } from 'react'
import { usd } from '../../constants'
import { ArrowLeft } from 'react-bootstrap-icons'
import Card from 'react-bootstrap/Card'
import { format } from 'timeago.js'

// server
import { getSession } from 'coda-auth/client'
import { connectDB, jparse } from '../../util/db'
import { Order } from '../../models'
import Button from 'react-bootstrap/Button'
import { useRouter } from 'next/router'

export default function orders({ orders }) {
  const router = useRouter()
  const [orderData, setOrderData] = useState()

  if (orderData) return <OrderDetail order={orderData} setOrderData={setOrderData} />

  console.log(orders)

  return (
    <>
      <Button variant="light" className="rounded-circle my-5 border" onClick={() => router.push('/account')} style={{width: '3rem', height: '3rem'}}>
        <ArrowLeft className="mb-1" size={18} />
      </Button>
      {orders.length === 0
        ? <h4 className="display-4">No orders found</h4>
        : <>
            <h4 className="display-4">Orders</h4>
            {orders.length > 0 && orders.map((order, index) => (
              <Card key={order._id} className="p-3 my-3 rounded shadow order-card" onClick={() => setOrderData(orders[index])}>
                <h4>order: {order._id}</h4>
                <p>payment vendor: {order.vendor}</p>
                <p>status: <span className={`${order.status === 'complete' ? 'text-success': 'text-primary'}`}>{order.status}</span></p>
                <p>amount: ${usd(order.amount)}</p>
                <p>created: {format(order.createdAt)}</p>
                <p>updated: {format(order.updatedAt)}</p>
              </Card>
            ))}
          </>
      }
    </>
  )
}

function OrderDetail({ order, setOrderData }) {
  return (
    <>
      <Button variant="light" className="rounded-circle my-5 border" onClick={() => setOrderData()} style={{width: '3rem', height: '3rem'}}>
        <ArrowLeft className="mb-1" size={18} />
      </Button>
      <Card className="p-3 my-3 rounded shadow">
        <h4>order: {order._id}</h4>
        <p>payment vendor: {order.vendor}</p>
        <p>status: <span className={`${order.status === 'complete' ? 'text-success': 'text-primary'}`}>{order.status}</span></p>
        <p>amount: ${usd(order.amount)}</p>
        <p>created: {format(order.createdAt)}</p>
        <p>updated: {format(order.updatedAt)}</p>
      </Card>
    </>
  )
}

export async function getServerSideProps(context) {
  const jwt = await getSession(context)
  if (!jwt) return { props: { } }
  await connectDB()
  const orders = await Order.find({user: jwt.id})
  return { props: { orders: jparse(orders) } }
}