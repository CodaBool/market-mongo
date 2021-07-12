import { useEffect, useState, useRef } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import { Check2, X } from 'react-bootstrap-icons'
import { format } from 'timeago.js'
import { StarSimple } from './Stars'
import genAvatar from '../../constants/genAvatar'

export default function Review({ review }) {
  const canvasRef = useRef(null)
  const [avatar, setAvatar] = useState()

  useEffect(() => {
    if (document && canvasRef?.current && !review.avatar) {
      const demo = new genAvatar({
        canvasID: 'review-avatar',
      }, document, canvasRef.current, review.author)
    }
    // setAvatar(demo)
  }, [])

  return (
    <Row className="my-4">
      <Col md={1} className="my-2">
        {review.avatar
          ? <img src={review.avatar} style={{width: '50px', height: '50px', borderRadius: '50%'}} />
          : <canvas ref={canvasRef} id="review-avatar" width="50" height="50" style={{borderRadius: '50%'}}></canvas>
        }
      </Col>
      <Col md={10}>
        <Card>

          {/* FLEX METHOD */}
          <div className="d-flex" style={{flexDirection: 'row', flexWrap: 'wrap'}}>
            <StarSimple value={review.stars} />
            <h5 className="ml-4" style={{marginTop: '.75rem'}}>{review.title}</h5>
          </div>

          {/* BOOTSTRAP METHOD */}
          {/* <Row>
            <Col className="" md={4}>
              <StarSimple value={review.stars} />
            </Col>
            <Col className="" md={8}>
              <h5 className="ml-4" style={{marginTop: '.75rem'}}>{review.title}</h5>
            </Col>
          </Row> */}

          {/* {comment.admin && <Card.Header>CodaBool</Card.Header>} */}
          <Card.Body>
            {/* {!comment.admin && <Card.Title>{comment.alias}</Card.Title>}
            {controls && 
              <p className={`
                ${comment.status == 'review' && 'text-warning'} 
                ${comment.status == 'approved' && 'text-info'}
                ${comment.status == 'archived' && 'text-danger'}
              `}>
                {comment.status}
              </p>
            } */}
            <p className="text-muted">{review.variant.name}</p>
            {review.content}
          </Card.Body>
          <Card.Footer className="text-muted">
            {format(review.createdAt)}
            {review.archived 
              ? <span className="text-danger ml-2 mt-1">Deleted</span>
              : <span className={`${review.published ? 'text-success': 'text-warning'} ml-2 mt-1`}>
                  {review.published ? 'Public' : 'Processing'}
                  {review.archived &&  'Deleted'}
                </span>
            }
          </Card.Footer>
        </Card>
      </Col>
    </Row>
  )
}
