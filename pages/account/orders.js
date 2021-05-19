// REWRITE v2
import { useState } from 'react'
import { usd } from '../../constants'

// server
import { getSession } from 'coda-auth/client'
import { connectDB, jparse } from '../../util/db'
import { Order } from '../../models'
import OrderDetail from '../../components/OrderDetail'
import Card from 'react-bootstrap/Card'
import { useRouter } from 'next/router'
import { format } from 'timeago.js'

export default function orders({ orders }) {
  const router = useRouter()
  const [orderData, setOrderData] = useState()

  if (orderData) return <OrderDetail order={orderData} setOrderData={setOrderData} />

  console.log(orders)
  
  return (
    <>
      <h1 className="display-4 my-4" onClick={() => router.push('/account')} style={{cursor: 'pointer'}}>Account</h1>
      {orders.length > 0 && orders.map((order, index) => (
        <Card key={order._id} className="p-3 my-3 rounded shadow order-card" onClick={() => setOrderData(orders[index])}>
          <h4>order: {order._id}</h4>
          <p>payment vendor: {order.vendor}</p>
          <p>status: <span className={`${order.status === 'complete' ? 'text-success': 'test-primary'}`}>{order.status}</span></p>
          <p>amount: ${usd(order.amount)}</p>
          <p>created: {format(order.createdAt)}</p>
          <p>updated: {format(order.updatedAt)}</p>
        </Card>
      ))}
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