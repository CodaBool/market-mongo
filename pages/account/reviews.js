import { useState, useEffect } from 'react'
import { ArrowLeft, PencilFill, X } from 'react-bootstrap-icons'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { useRouter } from 'next/router'
import { format } from 'timeago.js'
import { StarSimple } from '../../components/UI/Stars'

// server
import { getSession } from 'coda-auth/client'
import { connectDB, jparse } from '../../util/db'
import { Review } from '../../models'
import axios from 'axios'

export default function orders({ reviews }) {
  const router = useRouter()
  const [reviewData, setReviewData] = useState()

  if (reviewData) return <ReviewDetail review={reviewData} setReviewData={setReviewData} />

  console.log(reviews)

  return (
    <>
      <Button variant="light" className="rounded-circle my-5 border" onClick={() => router.push('/account')} style={{width: '3rem', height: '3rem'}}>
        <ArrowLeft className="mb-1" size={18} />
      </Button>
      {reviews.length === 0
        ? <h4 className="display-4">No reviews found</h4>
        : <>
            <h4 className="display-4">Reviews</h4>
            {reviews.length > 0 && reviews.map((review, index) => (
              <Card key={review._id} className="p-3 my-3 rounded shadow order-card" onClick={() => setReviewData(reviews[index])}>
                <h4>ID: {review._id}</h4>
                <p>product: {review.productId}</p>
                <p className="ml-3">{review.title}</p>
                <StarSimple value={review.stars} />
              </Card>
            ))}
          </>
      }
    </>
  )
}

function ReviewDetail({ review, setReviewData }) {
  const [showModal, setShowModal] = useState()

  function removeReview() {
    axios.put('/api/review', { _id: review._id})
      .then(res => {
        console.log(res.data)
        setReviewData(res.data)
      })
      .catch(err => console.log(err))
      .finally(() => setShowModal(false))
  }

  return (
    <>
      <Button variant="light" className="rounded-circle my-5 border" onClick={() => setReviewData()} style={{width: '3rem', height: '3rem'}}>
        <ArrowLeft className="mb-1" size={18} />
      </Button>
      <Card className="p-3 my-3 rounded shadow">
        <Row>
          <Col>
            <h4>{review.variant.name}</h4>
            <img src={review.variant.image} style={{width: '150px', height: '150px'}} />
          </Col>
          <Col>
            <>
              {!review.archived &&
                <div className="float-right">
                  <Button variant="light"><PencilFill className="mb-1" size={18} /></Button>
                  <X className="x-icon" size={42} onClick={() => setShowModal(true)} />
                </div>
              } 
              {review.archived 
                ? <span className="text-danger">Deleted</span>
                : <span className={`${review.published ? 'text-success': 'text-warning'}`}>
                    {review.published ? 'Public' : 'Processing'}
                    {review.archived &&  'Deleted'}
                  </span>
              }
              <hr className="w-100" style={{marginTop: '2rem'}} />
              <p className="">{review.title}</p>
              <StarSimple value={review.stars} />
              <p className="">{review.content}</p>
            </>
          </Col>
        </Row>
      </Card>
      <Modal show={!!showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you would like to <strong>delete</strong> your review of <strong>{review.variant.name}</strong>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={removeReview}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export async function getServerSideProps(context) {
  const jwt = await getSession(context)
  if (!jwt) return { props: { } }
  await connectDB()
  const reviews = await Review.find({ author: jwt.id })
  return { props: { reviews: jparse(reviews) } }
}