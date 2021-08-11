import { useState, useEffect } from 'react'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { X } from 'react-bootstrap-icons'
import Stars from './UI/Stars'
import Review from './UI/Review'
import ToastCustom from './UI/Toast'

export default function Reviews({ buildTimeReviews, productId, session, variants }) {
  const { handleSubmit, formState:{ errors }, setError, clearErrors, control, getValues, register, reset } = useForm()
  const [reviews, setReviews] = useState(buildTimeReviews)
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState()
  const [success, setSuccess] = useState()
  const [rating, setRating] = useState(0)

  const onSubmit = data => {
    if (rating === 0) {
      setError('rating')
      return
    }
    
    // find the selected variant
    const variant = variants.find(variant => variant.name === data.variant)

    axios.post('/api/review', {...data, rating, productId, variant})
      .then(res => {
        console.log(res.data)
        updateData()
        setSuccess(true)
        // reset form
        reset()
        setRating(0)
      })
      .catch(err => {
        console.log(err.response.data.msg)
        setToast(err.response.data.msg)
      })
  }

  function updateData() {
    axios.get('/api/review', {params: { productId }})
      .then(res => setReviews(res.data))
      .catch(err => console.log(err.response.data.msg))
  }

  useEffect(() => {
    if (rating && errors.rating) {
      clearErrors('rating')
    }
  }, [rating])

  useEffect(() => {
    // auto load any hidden personal reviews
    if (session) {
      const personalReviews = reviews.find(review => String(review.author) === session.id)
      if (!personalReviews) {
        // TODO: hurts performance, need to cache or put behind a button
        updateData()
      }
    }
  }, [session])

  return (
    <>
      {/* <button onClick={updateData} className="my-4">Refresh Reviews</button> */}
      {reviews.length > 0 && reviews.map(review => (
        <Review key={review._id} review={review} />
      ))}
      {showForm 
        ?
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Card className="rounded shadow p-4">
              <p className="text-muted">To post a review you must have ordered the product and have verified your email.</p>
              <X className="x-icon" onClick={() => setShowForm(false)} style={{position: 'absolute', right: '10px', top: '10px'}} size={42}/>
              <select className="form-control mb-2" {...register("variant")} defaultValue={variants[0].name || ''}>
                {variants.map(variant => variant.name).map((option, index) => <option key={index}>{option}</option>)}
              </select>
              {errors.rating && <p className="text-danger">Please Select a star rating out of 5</p>}
              <Stars rating={rating} setRating={setRating} />
              {errors.title && <p className="text-danger">Please keep your title under 75 characters</p>}
              <div className="in-group mt-4">
                <input 
                  className="material"
                  type="text"
                  {...register("title", { required: true, maxLength: 74 })}
                  defaultValue=""
                  required
                />
                <span className="bar"></span>
                <label className="in-label">Title</label>
              </div>
              {errors.content && <p className="text-danger">Please keep your review under 3000 characters</p>}
              <textarea 
                className="form-control" 
                placeholder="Review Details" 
                rows="3"
                {...register("content", { maxLength: 2999 })}
              />
              <Button
                className="mx-auto my-4 w-100"
                variant="outline-success"
                type="submit"
              >
                Submit Review
              </Button>
            </Card>
          </Form>
        : <Button onClick={() => setShowForm(true)} variant="light" className="my-5 mx-auto w-50">Write a Review</Button>
      }
      <div className="toastHolder" style={{position: 'fixed', top: '10%', right: '10%'}}>
        <ToastCustom show={!!success} setShow={setSuccess} title='Review Complete' body={<p className=""><strong>Thank You!</strong> Your review has been added and your feedback is appreciated</p>} />
        <ToastCustom show={!!toast} setShow={setToast} title='Could Not Complete Review' body={<p className="text-danger"><strong>{toast}</strong></p>} error />
      </div>
    </>
  )
}