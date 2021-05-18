// REWRITE v2
import { useState } from 'react'
import { usd } from '../../constants'

// server
import { getSession } from 'coda-auth/client'
import { connectDB, jparse } from '../../util/db'
import { Order } from '../../models'
import OrderDetail from '../../components/OrderDetail'
import Card from 'react-bootstrap/Card'

export default function orders({ orders }) {
  const [orderData, setOrderData] = useState()
  console.log('CLIENT orders', orders)

  if (orderData) return <OrderDetail order={orderData} setOrderData={setOrderData} />

  return (
    <>
      {orders.length > 0 && orders.map((order, index) => (
        <Card key={order._id} className="p-2 my-3" onClick={() => setOrderData(orders[index])} style={{cursor: 'pointer'}}>
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
      ))}
    </>
  )
}

export async function getServerSideProps(context) {
  const jwt = await getSession(context)
  if (!jwt) return { props: {  } }
  await connectDB()
  const orders = await Order.find({user: jwt.id})
  return { props: { orders: jparse(orders) } }
}