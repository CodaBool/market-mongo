import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Envelope, Person, Key, Check2Circle, Check2Square, Check2, Check } from 'react-bootstrap-icons'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import { useRouter } from 'next/router'
import Toast from '../../components/UI/Toast'
import useScreen from '../../constants/useScreen'
import { Load } from '../../components/Load'
import axios from 'axios'
import bcrypt from 'bcryptjs'

export default function Reset() {
  const [toastError, setToastError] = useState(null)
  const [submitting, setSubmitting] = useState()
  const [success, setSuccess] = useState(false)
  const { handleSubmit, formState:{ errors }, control, getValues, register } = useForm()
  const screen = useScreen()
  const router = useRouter()

  // useEffect(() => {
  //   console.log('router.query', router.query)
  // }, [router.query.id])

  const onSubmit = data => {
    setToastError(null) // remove error while waiting
    setSubmitting(true)
    bcrypt.hash(data.password, 12, (error, hash) => {
      console.log('sending hash', hash)
      if (error) console.log(error)
      axios.put('/api/auth/reset', { password: hash, token: router.query.id })
        .then(res => {
          console.log(res.data)
          if (res.data.updated) {
            setSuccess(true)
          }
        })
        .catch(err => setToastError(err.response.data.msg))
        .finally(() => setSubmitting(false))
    })
  }

  return (
    <>
      <h1 className="my-5 display-3 text-center">Reset Password</h1>
      <Col style={{ 
        maxWidth: `${screen.includes('m') ? '100%' : '40%'}`,
        margin: 'auto'
      }}>
        <Card className="shadow p-4 rounded">
          {success
            ?
              <div className="d-flex" style={{flexWrap: 'wrap'}}>
                <Check2Circle className="text-success mt-2 mr-4" size={40} />
                <h1>Success</h1>
                <p className="mt-3 w-100">Your new password has been saved. You may now login with your new password.</p>
                <Button
                  onClick={() => router.push({pathname: '/auth/login', query: { option: 'password' }})}
                  className="mx-auto"
                  size="lg"
                >
                  Login
                </Button>
              </div>
            :
            <Form className="mt-2" onSubmit={handleSubmit(onSubmit)}>
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
                {submitting 
                  ? <Load />
                  : <Button
                      className="mx-auto my-2"
                      style={{ width: '92%' }}
                      type="submit"
                    >
                      Save
                    </Button>
                }
              </Row>
            </Form>
          }
        </Card>
      </Col>
      
      <div className="toastHolder" style={{ position: 'fixed', top: '120px', right: '20px' }}>
        <Toast
          show={!!toastError}
          setShow={setToastError}
          title="Reset Issue"
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