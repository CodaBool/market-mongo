import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Envelope, Key, SkipEndFill, CaretRight, ArrowReturnRight, } from 'react-bootstrap-icons'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import { useRouter } from 'next/router'
import { Load } from '../../components/Load'
import { getProviders, signIn, useSession } from 'coda-auth/client'

export default function Login({ providers }) {
  const [session, loading] = useSession()
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const { handleSubmit, formState:{ errors }, control, register, setValue } = useForm()
  const router = useRouter()

  console.log('providers, ', providers)

  useEffect(() => {
    if (router.query.email) fill()
    if (router.query.error === 'nonexistant') setError('No user found by that email')
    if (router.query.error === 'invalid') setError('Invalid login')
    if (router.query.error === 'timeout') setError('Server Timeout, try again later')
    if (router.query.error === 'unkown') setError('Something went wrong')
  }, [router.query.error])

  function devLogin() {
    signIn('credentials', {
      email: 'test@user.com',
      password: 'testuser',
      callbackUrl: router.query.callbackUrl || ''
    })
  }

  function fill() {
    try {
      setValue('email', router.query.email)
      control.fieldsRef.current.password.ref.focus()
    } catch (err) {
      console.log('fill', err)
    }
  }

  const onSubmit = async data => {
    console.log(data, router.query.callbackUrl)
    if (data.email && data.password) {
      const callback = router.query.callbackUrl || ''
      signIn('credentials', {
        email: data.email,
        password: data.password,
        callbackUrl: callback
      })
    }
  }

  if (session) {
    router.push('/')
    return <Load />
  }

  return (
    <>
      <h1 className="my-4 display-3">Login</h1>
      {/* {Object.values(providers).map(provider => (
        <div key={provider.name}>
          <Button onClick={() => signIn(provider.id)}>{provider.name}</Button>
        </div>
      ))} */}
      <Form onSubmit={handleSubmit(onSubmit)}>
        <>
          <Envelope className="mr-3 mb-1" size={30} />
          <Form.Label>Email</Form.Label>
          <input className="form-control" type="email" placeholder='name@example.com' {...register("email", { required: true,  })} />
        </>
        <>
          <Key className="mr-3 mb-1" size={30} />
          <Form.Label>Password</Form.Label>
          <input 
            className="form-control" 
            type="password" 
            {...register("password", { required: true, minLength: 8 })} // sets rule pass >= 8
            placeholder="Password" 
            defaultValue=""
          />
          {errors.password && <p className="text-danger mt-4 mx-auto">Your password must be at least 8 characters</p>}
        </>
        <Row className="m-0 p-0">
          {error && <h4 className="text-danger mt-4 mx-auto">{error}</h4>}
          <Button
            className="mx-auto mt-5"
            style={{ width: '97.3%' }}
            type="submit"
          >
            Login
          </Button>
          <Button
            className="mx-auto mt-5"
            style={{ width: '97.3%' }}
            variant="outline-success"
            onClick={devLogin}
          >
            Or... Use Test Account <ArrowReturnRight className="ml-2" size={20} />
          </Button>
        </Row>
        {/* <div className="d-flex mx-3 my-5" style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'}}>
          
        </div> */}
        <p
          className="my-5 text-center signupText"
          onClick={() => router.push(`/auth/signup`)}
        >
          New Around? Signup Here.
        </p>
      </Form>
    </>
  )
}

export async function getServerSideProps(context){
  const providers = await getProviders()
  delete providers.credentials
  return {
    props: { providers }
  }
}