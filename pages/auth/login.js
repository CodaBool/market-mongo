import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Envelope, Key } from 'react-bootstrap-icons'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import { useRouter } from 'next/router'
import getConfig from 'next/config'
import { Load } from '../../components/Load'
// import { csrfToken, signIn, useSession } from 'coda-auth/client'
import { getCsrfToken, signIn, useSession } from 'coda-auth/client'
// import { getCsrfToken } from 'coda-auth/client'

export default function Login({ csrf }) {
  const [session, loading] = useSession()
  const [error, setError] = useState(null)
  const { handleSubmit, errors, control, register } = useForm()
  const router = useRouter()

  console.log('csrfToken', csrf)

  useEffect(() => {
    if (router.query.error === 'nonexistant') setError('No user found by that email')
    if (router.query.error === 'invalid') setError('Invalid login')
    if (router.query.error === 'unkown') setError('Something went wrong')
  }, [router.query.error])

  const onSubmit = (data) => {
    console.log(data, router.query.callbackUrl)
    if (data.email && data.password && data.csrf) {
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

  // if (isLoad(session, loading, false)) return <Load />

  return (
    <>
      <h1 className="my-4 display-3">Login</h1>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <input
          name="csrf"
          type="hidden"
          defaultValue={csrf}
          ref={register}
        />
        <Form.Group>
          <Envelope className="mr-3 mb-1" size={30} />
          <Form.Label>Email</Form.Label>
          <Controller
            as={<Form.Control />}
            control={control}
            type="email"
            name="email"
            defaultValue=""
            placeholder="name@example.com"
            required
          />
        </Form.Group>
        <Form.Group>
          <Key className="mr-3 mb-1" size={30} />
          <Form.Label>Password</Form.Label>
          <Controller
            as={<Form.Control />}
            control={control}
            type="password"
            name="password"
            placeholder="Password"
            defaultValue=""
            required
            rules={{
              minLength: 8 // sets rule pass >= 8
            }}
          />
          {errors.password && (
            <p className="errMsg">
              Your password must be at least 8 characters
            </p>
          )}
        </Form.Group>
        <Row>
          {error && <h4 className="text-danger mt-4 mx-auto">{error}</h4>}
          <Button
            className="mx-auto mt-5"
            style={{ width: '97.3%' }}
            variant="primary"
            type="submit"
          >
            Login
          </Button>
        </Row>
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

export async function getServerSideProps(context) {
  // const csrf = await csrfToken(context)
  console.log('ENV =', process.env)
  let csrf = {}
  await getCsrfToken(context)
    .then(res => {csrf= res; console.log('csrf=', res)})
    .catch(err => console.log(err))
  if (!csrf) csrf = 'didn\'t work'
  return {
    props: { csrf  }
  }
}
