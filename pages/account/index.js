import Button from 'react-bootstrap/Button'
import { useRouter } from 'next/router'

export default function index() {
  const router = useRouter()
  
  return (
    <>
      <Button onClick={() => router.push('/account/orders')}>Orders</Button>
    </>
  )
}
