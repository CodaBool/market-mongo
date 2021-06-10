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
import axios from 'axios'
import ReCAPTCHA from 'react-google-recaptcha'

const pattern = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/i
var lastId = ''

export default function newLogin({ providers }) {
  const { handleSubmit, formState:{ errors }, watch, control, register, setValue, getValues } = useForm()
  const [session, loading] = useSession()
  const screen = useScreen()
  const router = useRouter()
  const [option, setOption] = useState('quick')
  const [showNext, setShowNext] = useState(false)
  const [error, setError] = useState(null)
  const [newUser, setNewUser] = useState(false)
  const captcha = useRef(null)

  // debounces button disabling when typing email
  // for example after typing the '.' in 'gmail.com'
  // the email is invalid until another char is typed
  // this is bad ux and debounce allows for better ux
  useEffect(() => {
    const handler = setTimeout(() => {
      if (pattern.test(getValues('email'))) {
        setShowNext(true)
      } else {
        setShowNext(false)
      }
    }, 500)
    return () => clearTimeout(handler)
  }, [watch('email')]) 

  useEffect(() => {
    if (router.query.email) fill()
    if (router.query.error === 'nonexistant') setError('No user found by that email')
    if (router.query.error === 'invalid') setError('Invalid login')
    if (router.query.error === 'timeout') setError('Server Timeout, try again later')
    if (router.query.error === 'unkown') setError('Something went wrong')
  }, [router.query.error])

  // console.log('getValues(\'email\')', getValues('email'))

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

  function fill() {
    try {
      setOption('password')
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
      signIn('credentials', {
        email: data.email,
        password: data.password,
        callbackUrl: router.query.callbackUrl || ''
      })
    }
  }

  async function handleSignIn(id) {
    lastId = id
    console.log('get of email', getValues('email'))
    if (!getValues('email')) {
      console.log('no email')
      return
    }
    const result = await axios.get('/api/user', { params: { email: getValues('email') } })
      .then(res => res.data)
      .catch(err => console.log(err.response.data.msg))
      .catch(err => console.log(err))
    if (result.exists) {
      console.log('account exists')
      // TODO: signin using oauth
      signIn(id)
    } else {
      console.log('account DOESN\'T exist')
      setNewUser(true)
    }
  }

  async function postUser(token) {
    if (!token) {
      captcha.current.reset()
      return
    }
    const response = await axios.post('/api/user', { email: getValues('email'), id: lastId, token, passwordless: true })
      .then(res => res.data)
      .catch(err => console.log(err.response.data.msg))
      .catch(err => console.log(err))
    if (response.created) {
      signIn(lastId, null, {email: getValues('email')})
    } else {
      // TODO: display error
    }
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="mt-4">
      {Object.values(providers).map(provider => (
        <Button 
          onClick={() => signIn(provider.id)} 
          key={provider.name}
        >
          {provider.name}
        </Button>
      ))} 
      <h1 className="my-4 display-3 text-center">Login</h1>
      <Col>
        <Card className="my-5 shadow p-4 rounded"
          style={{ 
            maxWidth: `${screen.includes('m') ? '100%' : '40%'}`,
            margin: 'auto'
          }}
        >
          {!option 
            ?
            <Row className="">
              <Col lg={6} className="">
                <Button variant="outline-primary" className="w-100 my-2" onClick={() => setOption('password')}>
                  Password
                </Button>
              </Col>
              <Col lg={6} className="">
                <Button variant="outline-primary" className="w-100 my-2" onClick={() => setOption('quick')}>
                  Passwordless
                </Button>
              </Col>
            </Row>
            :
            <>
              <Button variant="light" className="rounded-circle mb-5 border" onClick={() => setOption(null)} style={{width: '3rem', height: '3rem'}}>
                <ArrowLeft className="mb-1" size={18} /> 
              </Button>
              {newUser 
              ?
                <ReCAPTCHA
                  className="mx-auto mt-3"
                  sitekey="6LdzfbIaAAAAAI0STn8vy1bTyG3qW0ECE06Untoh"
                  ref={captcha}
                  onChange={postUser}
                  size={`${screen.includes('s') ? 'compact': 'normal'}`}
                />
              : 
              <>
                {errors.email && <p className="text-danger text-center">Please provide a valid email</p>}
                <div className="in-group">
                  <input 
                    className="material"
                    type="text"
                    {...register("email", { required: true, pattern })}
                    defaultValue=""
                    required
                  />
                  <span className="bar"></span>
                  <label className="in-label"><Envelope className="mr-2 mb-1" size={20} />Email</label>
                </div>
                {option === 'password' &&
                  <>
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
                        onClick={() => router.push(`/auth/signup`)} 
                        className="signup-button mx-auto"
                      >
                        Signup
                      </Button>
                    </Row>
                  </>
                }
                {errors.password && <p className="text-danger mt-4 mx-auto">Your password must be at least 8 characters</p>}
                {(option === 'quick' && showNext) &&
                  <div className="d-flex" style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center'}}>
                    {Object.values(providers).map(provider => (
                      <Button 
                        onClick={() => handleSignIn(provider.id)} 
                        disabled={!getValues('email')} 
                        style={{width: '9em'}}
                        key={provider.name}
                        variant="outline-primary"
                        className="m-1"
                      >
                          {provider.name}
                      </Button>
                    ))} 
                  </div>
                }
              </>
              }
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
  // delete providers.credentials
  return { props: { providers } }
}