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

const SOURCE_EMAIL = 'codabool@pm.me'

export default function Request() {
  const [submitting, setSubmitting] = useState(false)
  const [toastError, setToastError] = useState(null)
  const [submitted, setSubmitted] = useState()
  const { handleSubmit, formState:{ errors }, control, getValues, register } = useForm()
  const screen = useScreen()
  const router = useRouter()

  const onSubmit = data => {
    setToastError(null) // remove error while waiting
    console.log('data', data)
    axios.post('/api/auth/reset', data)
      .then(res => setSubmitted(true))
      .catch(err => setToastError(err.response.data.msg))
  }

  return (
    <>
      <h1 className="my-5 display-3 text-center">Reset Password</h1>
      <Col style={{ 
        maxWidth: `${screen.includes('m') ? '100%' : '40%'}`,
        margin: 'auto'
      }}>
        <Card className="shadow p-4 rounded">
          {submitted 
          ?
            <div className="d-flex" style={{flexWrap: 'wrap'}}>
              <Check2Circle className="text-success mt-2 mr-4" size={40} />
              <h1>Email Sent</h1>
              <p className="mt-3" style={{width: '100%'}}>Thanks! Check your inbox for {getValues('email')} you'll get an email with a link to reset your password shortly. If it is missing please check your spam folder as well.</p>
            </div>
          :
            <Form className="mt-2" onSubmit={handleSubmit(onSubmit)}>
              {errors.email ? <p className="text-danger mb-4"> Please enter a valid email</p> : <div className="mb-5"></div>}
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
              <Row>
                {submitting 
                  ? <Load />
                  : <Button
                      className="mx-auto my-2"
                      style={{ width: '92%' }}
                      type="submit"
                    >
                      Send Email
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