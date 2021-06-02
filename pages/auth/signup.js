/* React Form Hook, provides the best control
for forms. There is a way to get server side error messages
e.g. 'This email is already in use' */
import React, { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import bcrypt from 'bcryptjs'
import { Envelope, Person, Key } from 'react-bootstrap-icons'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import { useRouter } from 'next/router'
import { signIn, useSession } from 'coda-auth/client'
import ReCAPTCHA from "react-google-recaptcha"
import { Load } from '../../components/Load'
import Toast from '../../components/UI/Toast'
import useScreen from '../../constants/useScreen'
import axios from 'axios'

export default function Signup() {
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [session, loading] = useSession()
  const [success, setSuccess] = useState(false)
  const [toastError, setToastError] = useState('')
  const { handleSubmit, watch, formState:{ errors }, control, getValues, register } = useForm()
  const captcha = useRef(null)
  const screen = useScreen()
  const router = useRouter()

  const onSubmit = (data) => {
    console.log(data.email)
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
  if (session) router.push('/')

  return (
    <>
      <h1 className="my-4 display-3 text-center">Sign Up</h1>
      <Col style={{ 
        maxWidth: `${screen.includes('m') ? '100%' : '40%'}`,
        margin: 'auto'
      }}>
        <Card className="shadow p-4 rounded">
          <Form className="mt-2" onSubmit={handleSubmit(onSubmit)}>
            {errors.email && <p className="text-danger mt-2"> Please enter a valid email</p>}
            <div className="in-group">
              <input 
                className="material"
                type="text"
                {...register("email", { required: true, pattern: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/i })}
                defaultValue=""
                required
              />
              <span className="bar"></span>
              <label className="in-label"><Envelope className="mr-3 mb-1" size={20} />Email</label>
            </div>
            {errors.password && <p className="errMsg text-danger">Your password must be at least 8 characters</p>}
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
            {errors.confirmPass && <p className="errMsg text-danger">Your password must match</p>}
            <div className="in-group">
              <input 
                className="material"
                type="password"
                {...register("confirmPass", { required: true, minLength: 8, validate: () => {
                  return getValues('password') === getValues('confirmPass')
                } })}
                defaultValue=""
                required
              />
              <span className="bar"></span>
              <label className="in-label"><Key className="mr-2 mb-1" size={20} />{`${screen.includes('s') ? 'Confirm' : 'Confirm Password'}`}</label>
            </div>
            <Row>
              <ReCAPTCHA
                className="mx-auto mt-3"
                hidden={submitting}
                sitekey="6LdzfbIaAAAAAI0STn8vy1bTyG3qW0ECE06Untoh"
                ref={captcha}
                size={`${screen.includes('s') ? 'compact': 'normal'}`}
              />
              {submitting 
                ? <Load />
                : <Button
                    className="mx-auto my-5"
                    style={{ width: '92%' }}
                    variant="primary"
                    type="submit"
                  >
                    Sign Up
                  </Button>
              }
            </Row>
          </Form>
        </Card>
      </Col>
      
      <div className="toastHolder" style={{ position: 'fixed', top: '120px', right: '20px' }}>
        <Toast
          show={!!toastError}
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
