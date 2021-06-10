import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import { useRouter } from 'next/router'
import { useSession } from 'coda-auth/client'
import { Load } from '../../components/Load'

// serverside
import { connectDB } from '../../util/db'
import { User, Token } from '../../models'
import axios from 'axios'
import { Check2Circle } from 'react-bootstrap-icons'

export default function Signup({ status, msg, resend }) {
  const [reqStatus, setReqStatus] = useState()
  const router = useRouter()
  const [session, loading] = useSession()

  function handleClick() {
    setReqStatus('sent')
    axios.post('/api/auth/token')
      .then(res => {
        setReqStatus('success')
        console.log(res.data)
      })
      .catch(err => {console.log(err); console.log(err.response.data.msg)})
  }

  if (status === 'verified') return (
    <>
      <h1 className="my-5 display-4">Thank You</h1>
      <Card className="shadow p-4 rounded mt-5">
        <div className="d-flex" style={{flexWrap: 'wrap'}}>
          <Check2Circle className="text-success mt-2 mr-4" size={40} />
          <h1>Verified</h1>
        </div>
        <h3 className="mt-3">Your Email has been verified!</h3>
      </Card>
    </>
  )

  if (msg) {
    return (
      <>
        <h1 className="my-5 display-4">Error</h1>
        <h3 className="my-2">{msg}</h3>
        {resend && 
          <Row>
            <Button 
              onClick={() => router.push(`/auth/reset`)} 
              className="mx-auto my-4"
              size="lg"
            >
              Resend
            </Button>
          </Row>
        }
      </>
    )
  }

  if (!session) return <Load msg="Please Login" />

  return (
    <>
      <h1 className="my-5 display-4">Verify</h1>
      <Card className="shadow p-4 rounded">
        {reqStatus === 'success'
          ? 
            <div className="d-flex" style={{flexWrap: 'wrap'}}>
              <Check2Circle className="text-success mt-2 mr-4" size={40} />
              <h1>Email Sent</h1>
              <h4 className="mt-3">Thanks! Check your inbox for {session.user.email} you'll get an email with a link to verify your account shortly. If it is missing please check your spam folder as well.</h4>
            </div>
          : <h4 className="my-4 mx-auto">To verify your account we will send an email to <strong>{session.user.email}</strong>. To begin, please click on the button below</h4>
        }
        <Row>
          {reqStatus === 'sent' && <Load small />}
          {!reqStatus && <Button
              className="mx-auto my-4"
              onClick={handleClick} 
            >
              Send Email
            </Button>
          }
        </Row>
      </Card>
    </>
  )
}

export async function getServerSideProps(context) {
  console.log('context.query.id', context.query.id)
  if (!context.query.id) return { props: { } }
  await connectDB()
  const token = await Token.findOne({ token: context.query.id })
  console.log('token found', token)
  if (!token) return { props: { resend: true, msg: 'Your verification link may have expired. Please click on resend to send another verification email.' } }
  const user = await User.findById(token.user)
  console.log('user', user)
  if (!user) return { props: { resend: true, msg: 'The account associated with this link could not be located'} }
  if (user.verified) return { props: { msg: 'Your email has already been verified' } }
  const newUser = await User.findByIdAndUpdate(token.user, { verified: true }, {new: true})
  console.log('newUser', newUser)
  return { props: { status: 'verified' } }
}