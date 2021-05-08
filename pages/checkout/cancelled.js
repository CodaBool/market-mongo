import { useRouter } from 'next/router'

// server
// import { getAuthenticatedUser } from '../api/user'
import { getSession } from 'coda-auth/client'

export default function cancelled({ data }) {
  const router = useRouter()
  console.log(router.query.id)
  console.log('client', data)
  return (
    <>
      <h1 className="display-3 my-4">
        Order Cancelled
      </h1>
      <p>Amount: {data.amount}</p>
      <p>Currency: {data.currency}</p>
      <p>Status: {data.status}</p>
      <p>Email: {data.email}</p>
    </>
  )
}

export async function getServerSideProps(context) {
  const stripe = require('stripe')(process.env.STRIPE_SK)

  const session = await stripe.checkout.sessions.retrieve(context.query.id)
  const jwt = await getSession(context)

  // MONGO USER
  // const user = await getAuthenticatedUser(context)
  
  // INTENT
  // const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent)

  // CUSTOMER
  // const customer = await stripe.customers.retrieve(jwt.customerId)

  // Extract useful info
  const data = {
    amount: session.amount_total,
    currency: session.currency,
    status: session.payment_status,
    customer: session.customer,
    email: jwt.user.email
  }

  if (!session || !jwt) return { props: {  } }
  return { props: { data } }
}