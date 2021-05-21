/* React Form Hook, provides the best control
for forms. There is a way to get server side error messages
e.g. 'This email is already in use' */
import React, { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import bcrypt from 'bcryptjs'
import { Envelope, Person, Key } from 'react-bootstrap-icons'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import { useRouter } from 'next/router'
import { signIn, useSession } from 'coda-auth/client'
import ReCAPTCHA from "react-google-recaptcha"
import { Load } from '../../components/Load'
import Toast from '../../components/Toast'
import axios from 'axios'

export default function Signup() {
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [session, loading] = useSession()
  const [success, setSuccess] = useState(false)
  const [toastError, setToastError] = useState('')
  const { handleSubmit, watch, errors, control, getValues } = useForm()
  const captcha = useRef(null)

  const onSubmit = (data) => {
    setSubmitting(true)
    const token = captcha.current.getValue()
    if (token !== "") {
      bcrypt.hash(data.password, 12, (error, hash) => {
        axios
          .post('/api/customer', {
            email: data.email,
            password: hash,
            token: token,
          })
          .then(res => {
            setSuccess(true)
            signIn('credentials', {
              email: data.email,
              password: data.password,
              callbackUrl: ''
            })
          })
          .catch(err => setToastError(err.response.data.msg))
        .finally(() => {
          captcha.current.reset()
          setSubmitting(false)
        })
      })
    } else {
      console.log('captcha has no value')
      setSubmitting(false)
    }
  }

  // if (isLoad(session, loading) || success) return <Load />
  // if (session) router.push('/')

  return (
    <>
      <h1 className="display-3 mt-3">Sign Up</h1>
      <Form onSubmit={handleSubmit(onSubmit)}>
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
          rules={{
            validate: () => {
              if (
                !/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/.test(
                  getValues('email')
                )
              )
                return false
            }
          }}
        />
        {errors.email && (
          <p className="text-danger text-center mt-4">
            Please enter a valid email
          </p>
        )}
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
          <p className="errMsg text-danger">Your password must be at least 8 characters</p>
        )}
        <Key className="mr-3 mb-1" size={30} />
        <Form.Label>Confirm Password</Form.Label>
        <Controller
          as={<Form.Control />}
          control={control}
          type="password"
          name="confirmPass"
          placeholder="Confirm Password"
          defaultValue=""
          required
          rules={{
            validate: () => {
              return getValues('password') === getValues('confirmPass')
            }
          }}
        />
        {errors.confirmPass && (
          <p className="errMsg text-danger">Your password must match</p>
        )}
        <Row>
          <ReCAPTCHA
            className="mx-auto mt-3"
            hidden={submitting}
            sitekey="6LdzfbIaAAAAAI0STn8vy1bTyG3qW0ECE06Untoh"
            ref={captcha}
          />
          {submitting 
            ? <Load />
            : <Button
                className="mx-auto my-5"
                style={{ width: '97.3%' }}
                variant="primary"
                type="submit"
              >
                Sign Up
              </Button>
          }
        </Row>
      </Form>
      <div className="toastHolder" style={{ position: 'fixed', top: '120px', right: '20px' }}>
        <Toast
          show={toastError}
          setShow={setToastError}
          title="Signup Issue"
          error
          body={
            <h5 className="text-danger">
              {toastError}
            </h5>
          }
        />
      </div>
    </>
  )
}
