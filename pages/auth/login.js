import { useState, useEffect, useRef } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import { Envelope, Key, ArrowReturnRight, ArrowLeft } from 'react-bootstrap-icons'
import { getProviders, signIn, useSession } from 'coda-auth/client'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import useScreen from '../../constants/useScreen'
import { Load } from '../../components/Load'
import Toast from '../../components/UI/Toast'

export default function newLogin({ providers }) {
  const { handleSubmit, formState:{ errors }, watch, control, register, setValue, getValues } = useForm()
  const [session, loading] = useSession()
  const screen = useScreen()
  const router = useRouter()
  const [option, setOption] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log('email', router.query.email)
    if (router.query.option) setOption('password')
    if (router.query.email) setOption('password')
    if (router.query.error === 'invalid') setError('Invalid login')
    if (router.query.error === 'unkown') setError('Something went wrong')
    if (router.query.error === 'timeout') setError('Server Timeout, try again later')
    if (router.query.error === 'nonexistant') setError('No user found by that email')
    if (router.query.error === 'OAuthAccountNotLinked') setError('To confirm your identity, sign in with the same account you used originally.')
  }, [router.query.error])

  useEffect(() => {
      console.log('providers, client', providers)
  }, [])

  useEffect(() => {
    if (option === 'password' && router.query.error === 'invalid') {
      setValue('email', router.query.email)
      try {
        control.fieldsRef.current.password._f.ref.focus()
      } catch (err) {
        console.log('fill', err)
      }
    }
    if (option === 'password' && router.query.option) {
      try {
        control.fieldsRef.current.email._f.ref.focus()
      } catch (err) {
        console.log('set focus error', err)
      }
    }
  }, [option])

  if (session) {
    router.push('/')
    return <Load />
  }

  function devLogin() {
    setOption('password')
    setValue('email', 'test@user.com')
    setValue('password', 'testuser')
    signIn('credentials', {
      email: 'test@user.com',
      password: 'testuser',
      // redirect: false,
      callbackUrl: router.query.callbackUrl || ''
    })
  }

  async function onSubmit(data) {
    console.log(data)
    if (data.email && data.password) {
      signIn('credentials', {
        email: data.email,
        password: data.password,
        callbackUrl: router.query.callbackUrl || ''
      })
    }
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="mt-4">
      <h1 className="my-4 display-3 text-center">Login</h1>
      <Col>
        <Card className="my-5 shadow p-4 rounded"
          style={{ 
            maxWidth: `${screen.includes('m') ? '100%' : '40%'}`,
            margin: 'auto'
          }}
        >
          {!option &&
            <>
              <Button variant="outline-primary" className="mx-auto my-2" style={{width: '9em'}} onClick={() => setOption('password')}>
                Password
              </Button>
              <div className="border w-100 my-3"></div>
              <div className="d-flex" style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center'}}>
                {Object.values(providers).map(provider => (
                  <Button 
                    onClick={() => signIn(provider.id, { callbackUrl: router.query.callbackUrl || '' })} 
                    style={{width: '9em'}}
                    key={provider.name}
                    variant="outline-primary"
                    className="m-1"
                  >
                      {provider.name}
                  </Button>
                ))} 
              </div>
            </>
          }
          {option && 
            <>
              <Button variant="light" className="rounded-circle mb-5 border" onClick={() => setOption(null)} style={{width: '3rem', height: '3rem'}}>
                <ArrowLeft className="mb-1" size={18} /> 
              </Button>
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
              {errors.password && <p className="text-danger mt-4 mx-auto">Your password must be at least 8 characters</p>}
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
              <Button
                className="w-100"
                type="submit"
              >
                Login
              </Button>
              <Row className="mt-4" style={{height: '4em'}}>
                <Button 
                  variant="link" 
                  onClick={() => router.push(`/auth/request`)} 
                  className="signup-button mx-auto"
                >
                  Forgot Password?
                </Button>
                <Button 
                  variant="link" 
                  onClick={() => router.push(`/auth/signup`)} 
                  className="signup-button mx-auto"
                >
                  Signup
                </Button>
              </Row>
            </>
          }
        </Card>
      </Col>
      <Row>
        <Button
          className="mx-auto my-2"
          variant="light"
          style={{width: '10em'}}
          onClick={devLogin}
        >
          Skip <ArrowReturnRight className="ml-2" size={18} />
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
  console.log('providers', providers)
  delete providers.credentials
  return { props: { providers } }
}