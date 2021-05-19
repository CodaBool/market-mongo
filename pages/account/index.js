import Button from 'react-bootstrap/Button'
import { useRouter } from 'next/router'

export default function index() {
  const router = useRouter()
  
  return (
    <>
      <h1 className="display-4 my-4" style={{cursor: 'pointer'}}>Account</h1>
      <Button variant="outline-primary" onClick={() => router.push('/account/orders')}>See My Orders</Button>
    </>
  )
}
