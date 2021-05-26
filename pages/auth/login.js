import { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form'
import Accordion from 'react-bootstrap/Accordion'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import { Envelope, Key, ArrowReturnRight, BoxArrowUpRight, FileLock } from 'react-bootstrap-icons'
import { getProviders, signIn, useSession } from 'coda-auth/client'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import useScreen from '../../constants/useScreen'
import { Load } from '../../components/Load'
import Toast from '../../components/UI/Toast'

export default function newLogin({ providers }) {
  const [showKey0Hint, setShowKey0Hint] = useState(false)
  const [showKey1Hint, setShowKey1Hint] = useState(false)
  const [skip, setSkip] = useState(false)
  const [key, setKey] = useState('0')
  const screen = useScreen()
  const router = useRouter()
  const [session, loading] = useSession()

  function devLogin() {
    setKey('1')
    setSkip(true)
    signIn('credentials', {
      email: 'test@user.com',
      password: 'testuser',
      callbackUrl: router.query.callbackUrl || ''
    })
  }

  if (session) {
    router.push('/')
    return <Load />
  }

  return (
    <>
      <h1 className="my-4 display-3 text-center">Login</h1>
      <Col>
        <Accordion className="my-5" defaultActiveKey={key} activeKey={key}
          style={{ 
            maxWidth: `${screen.includes('m') ? '100%' : '40%'}`,
            margin: 'auto'
          }}
        >
          <Card className="shadow" style={{border: 'none'}}>
            <Accordion.Toggle as={Card.Header} eventKey="0" onClick={() => setKey('0')}
              onMouseEnter={() => setShowKey0Hint(true)}
              onMouseLeave={() => setShowKey0Hint(false)}
            >
              <BoxArrowUpRight className="ml-1"  size={35} />
              {<span className="ml-4 fade-in" style={{opacity: `${showKey0Hint ? '1': '0'}`}}>External</span>}
            </Accordion.Toggle>
            <Accordion.Collapse eventKey="0">
              <Card.Body className="d-flex" style={{justifyContent: 'center', flexDirection: 'column', flexWrap: 'nowrap'}}>
                {Object.values(providers).map(provider => (
                  <div key={provider.name} className="mx-auto my-2">
                    <Button onClick={() => signIn(provider.id)} style={{width: '10em'}}>{provider.name}</Button>
                  </div>
                ))}
                <hr className="border w-100"/>
                <Button className="mx-auto my-2" onClick={() => setKey('1')} style={{width: '10em'}}>Credential</Button>
                <Button
                  className="mx-auto my-2"
                  variant="success"
                  style={{width: '10em'}}
                  onClick={devLogin}
                >
                  Skip <ArrowReturnRight className="ml-2" size={18} />
                </Button>
              </Card.Body>
            </Accordion.Collapse>
          </Card>
          <Card className="shadow" style={{border: 'none'}}>
            <Accordion.Toggle as={Card.Header} eventKey="1" onClick={() => setKey('1')}
              onMouseEnter={() => setShowKey1Hint(true)}
              onMouseLeave={() => setShowKey1Hint(false)}
            >
              <FileLock className="" size={40} />
              {<span className="ml-4 fade-in" style={{opacity: `${showKey1Hint ? '1': '0'}`}}>Credential</span>}
            </Accordion.Toggle>
            <Accordion.Collapse eventKey="1">
              <Card.Body>
                <LoginForm router={router} skip={skip} accordianKey={key} setKey={setKey} />
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
      </Col>
    </>
  )
}

function LoginForm({ router, skip, accordianKey, setKey }) {
  const { handleSubmit, formState:{ errors }, control, register, setValue } = useForm()
  const [error, setError] = useState(null)

  useEffect(() => {
    if (accordianKey === '1') {
      const timeout = setTimeout(() =>  control.fieldsRef.current.email._f.ref.focus(), 300)
      return () => clearTimeout(timeout)
    }
  }, [accordianKey])

  useEffect(() => {
    if (Object.keys(router.query).length > 0) setKey('1')
    if (router.query.email) fill()
    if (router.query.error === 'nonexistant') setError('No user found by that email')
    if (router.query.error === 'invalid') setError('Invalid login')
    if (router.query.error === 'timeout') setError('Server Timeout, try again later')
    if (router.query.error === 'unkown') setError('Something went wrong')
  }, [router.query.error])

  useEffect(() => {
    if (skip) {
      setValue('email', 'test@user.com')
      setValue('password', 'testuser')
    }
  }, [skip])

  function fill() {
    try {
      setValue('email', router.query.email)
      // control.fieldsRef.current.password.ref.focus()
      control.fieldsRef.current.password._f.ref.focus()
    } catch (err) {
      console.log('fill', err)
    }
  }
  async function onSubmit(data) {
    console.log(data)
    if (data.email && data.password) {
      const callback = router.query.callbackUrl || ''
      signIn('credentials', {
        email: data.email,
        password: data.password,
        callbackUrl: callback
      })
    }
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="mt-4">
      {errors.email && <p className="text-danger text-center">Please provide a valid email</p>}
      <div className="in-group">
        <input 
          className="material"
          type="text"
          {...register("email", { required: true, pattern: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/i })}
          defaultValue=""
          required
        />
        <span className="bar"></span>
        <label className="in-label"><Envelope className="mr-2 mb-1" size={20} />Email</label>
      </div>
      <div className="in-group">
        <input 
          className="material"
          type="password"
          {...register("password", { required: true, minLength: 8 })} // sets rule pass >= 8
          defaultValue=""
          required
        />
        <span className="bar"></span>
        <label className="in-label"><Key className="mr-2 mb-1" size={20} />Password</label>
      </div>
      {errors.password && <p className="text-danger mt-4 mx-auto">Your password must be at least 8 characters</p>}
      <Button
        className="w-100"
        type="submit"
      >
        Login
      </Button>
      <Row className="mt-4" style={{height: '4em'}}>
        <Button 
          variant="link" 
          onClick={() => router.push(`/auth/signup`)} 
          className="signup-button mx-auto"
        >
          Signup
        </Button>
      </Row>
      <div className="toastHolder" style={{position: 'fixed', top: '10%', right: '10%'}}>
        <Toast show={!!error} setShow={setError} title='Could not Sign you in' body={<p className="text-danger"><strong>{error}</strong></p>} error />
      </div>
    </Form>
  )
}

export async function getServerSideProps(context){
  const providers = await getProviders()
  delete providers.credentials
  return { props: { providers } }
}