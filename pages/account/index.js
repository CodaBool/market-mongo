import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import { useRouter } from 'next/router'
import { useSession, getSession } from 'coda-auth/client'

// serverside
import { connectDB, jparse } from '../../util/db'
import { User } from '../../models'

export default function index({ user }) {
  const router = useRouter()
  // const [session, loading] = useSession()

  console.log('user', user)
  
  return (
    <>

      {/* Alert the user if their account is not verified */}
      {!user?.verified &&
        <Alert variant="warning" className="text-center">
          Your email has not been verified. Check your inbox for an email, or
          <a
            className="text-primary ml-1" 
            onClick={() => router.push('/auth/verify')}
            style={{cursor: 'pointer'}}
          >
            Resend
          </a>
        </Alert>
      }

      <h1 className="display-4 my-4" style={{cursor: 'pointer'}}>Account</h1>
      <Button variant="outline-primary" onClick={() => router.push('/account/orders')}>See My Orders</Button>
    </>
  )
}

export async function getServerSideProps(context) {
  const jwt = await getSession(context)
  if (!jwt) return { props: { } }
  await connectDB()
  const user = await User.findById(jwt.id)
  user.password = undefined
  return { props: { user: jparse(user) } }
}