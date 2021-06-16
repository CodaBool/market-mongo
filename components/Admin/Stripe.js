import React, { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form'
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import axios from 'axios'
import { ImageFill, CloudCheckFill, ArrowClockwise } from 'react-bootstrap-icons'
import { useForm, Controller } from 'react-hook-form'
import Toast from '../UI/Toast'
import useDebounce from '../../constants/useDebounce'
import BoxImg from '../UI/BoxImg'

export default function admin() {
  const [show, setShow] = useState(false)
  const [showError, setShowError] = useState(false)
  const [showGenericError, setShowGenericError] = useState(false)
  const [products, setProducts] = useState(null)
  const [product, setProduct] = useState(null)
  const [showUpdate, setShowUpdate] = useState(false)
  const [loadProduct, setLoadProduct] = useState(false)
  const [uid, setUid] = useState('')
  const debounce = useDebounce(uid, 1000)
  const [modalData, setModalData] = useState({})
  const { handleSubmit, formState:{ errors }, setError, clearErrors, control, getValues, register, reset, setValue, watch } = useForm()
  
  useEffect(() => setUid(watch('u-id')), [watch])
  useEffect(() => fillData(uid), [debounce])

  const onUpdateSubmit = (data) => {
    const product = {
      active: data['u-active'],
      name: data['u-name'],
      description: data['u-description']
    }
    axios.put('/api/admin/stripe/product', {id: data['u-id'], product})
      .then(res => {
        console.log(res.data)
        reset()
        setModalData({name: res.data.name, id: res.data.id})
        setShowUpdate(true)
      })
      .catch(err => {
        console.log(err.response.data.msg)
        if (err.response.data.msg.includes('Unauthorized')) {
          setShowError(true)
        } else {
          setShowGenericError(true)
        }
      })
  }
      
  const onCreateSubmit = (data) => {
    console.log('sub post')
    const product = { active: data['c-active'], name: data['c-name'], description: data['c-description'] || undefined }
    console.log('sub product', product)
    axios.post('/api/admin/stripe/product', product)
      .then(res => {
        console.log(res.data)
        reset()
        setModalData({name: res.data.name, id: res.data.id})
        setShow(true)
      })
      .catch(err => {
        console.log(err.response.data.msg)
        if (err.response.data.msg.includes('Unauthorized')) {
          setShowError(true)
        } else {
          setShowGenericError(true)
        }
      })
  }

  function getProducts(active) {
    axios.get('/api/admin/stripe/product', { params: { active }})
      .then(res => setProducts(res.data))
      .catch(err => console.log(err))
  }

  function fillData() {
    if (uid) {
      setLoadProduct(true)
      axios.get('/api/admin/stripe/product', { params: {id: uid} })
        .then(res => {
          setProduct(res.data)
          setValue('u-name', `${res.data.name ? res.data.name : ''}`)
          setValue('u-active', `${res.data.active ? res.data.active : ''}`)
          setValue('u-description', `${res.data.description ? res.data.description : ''}`)
        })
        .catch(err => {
          console.log(err.response.data.msg)
        })
        .finally(setLoadProduct(false))
    }
  }

  return (
    <>
    <Accordion className="my-5" defaultActiveKey="0">
      <h1 className="display-4">Stripe</h1>
      <Card>
        <Accordion.Toggle as={Card.Header} eventKey="0">
          Products
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="0" className="expandable">
          <>
            <Row className="p-3">
              <Col>
                <Button className="w-100" variant="info" onClick={() => getProducts(false)}>Inactive Products <ArrowClockwise className="ml-2 mb-1" size={14}/></Button>
              </Col>
              <Col>
                <Button className="w-100" variant="info" onClick={() => getProducts(true)}>Active Products<ArrowClockwise className="ml-2 mb-1" size={14}/></Button>
              </Col>
            </Row>
            <Row className="m-2">
              {products && products.map(product => (
                <Card key={product.id} className="m-2" style={{maxWidth: '250px'}}>
                  <BoxImg imageUrl={product.coverImg} alt={product.name} small />
                  <Button href={`https://dashboard.stripe.com/test/products/${product.id}/edit`} target="_blank" variant="outline-primary" className="my-2 mx-4">Edit Image</Button>
                  <h6><strong>ID: </strong> {product.id}</h6>
                  <h6><strong>Name: </strong> {product.name}</h6>
                  <h6><strong>description: </strong> {product.description}</h6>
                  <h6><strong>active: </strong> <p className={`${product.active ? 'text-success' : 'text-danger'} d-inline`}>{product.active ? 'Active' : 'Archived'}</p></h6>
                  <h6><strong>livemode: </strong> <p className={`${product.livemode ? 'text-success' : 'text-danger'} d-inline`}>{product.livemode ? 'True' : 'False'}</p></h6>
                </Card>
              ))}
            </Row>
          </>
        </Accordion.Collapse>
      </Card>
      <Card>
        <Accordion.Toggle as={Card.Header} eventKey="1">
          Update Product
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="1" className="expandable">
          <Form onSubmit={handleSubmit(onUpdateSubmit)}>
            <Card.Body>
              <>
                {errors['u-id'] && <p className="text-danger text-center">Error</p>}
                <div className="in-group">
                  <input 
                    className="material"
                    type="text"
                    {...register("u-id")}
                    defaultValue=""
                    required
                  />
                  <span className="bar"></span>
                  <label className="in-label">Product ID</label>
                </div>
                {errors['u-name'] && <p className="text-danger text-center">Error</p>}
                <div className="in-group">
                  <input 
                    className="material"
                    type="text"
                    {...register("u-name")}
                    defaultValue=""
                    required
                  />
                  <span className="bar"></span>
                  <label className="in-label">Name</label>
                </div>
                <Form.Label>Active</Form.Label>
                <select className="form-control mb-4" {...register("u-active")} defaultValue="">
                  {['true', 'false'].map((option, index) => <option key={index}>{option}</option>)}
                </select>
                {errors['u-description'] && <p className="text-danger text-center">Error</p>}
                <textarea 
                  {...register("u-description")}
                  className="form-control"
                  placeholder="Description"
                  rows="5"
                />
                <Row className="my-4">
                  <Button href={`https://dashboard.stripe.com/test/products/${uid}/edit`} target="_blank" variant="outline-primary" className="mx-auto" style={{width: '97%'}}>
                    Edit Image
                    <ImageFill className="ml-2 mb-1" size={14}/>
                  </Button>
                </Row>
                <Row className="my-5">
                  <Button variant="success" type="submit" className="mx-auto" style={{width: '97%'}}>
                    Update Product
                    <CloudCheckFill className="ml-2 mb-1" size={14}/>
                  </Button>
                </Row>
              </>
            </Card.Body>
            </Form>
          </Accordion.Collapse>
        </Card>
        <Card>
          <Accordion.Toggle as={Card.Header} eventKey="2">
            Create Product
          </Accordion.Toggle>
          <Accordion.Collapse eventKey="2" className="expandable">
            <Form onSubmit={handleSubmit(onCreateSubmit)}>
              <Card.Body>
                {errors['c-name'] && <p className="text-danger text-center">Error</p>}
                <div className="in-group">
                  <input 
                    className="material"
                    type="text"
                    {...register("c-name")}
                    defaultValue=""
                    required
                  />
                  <span className="bar"></span>
                  <label className="in-label">Name</label>
                </div>
                <Form.Label>Active</Form.Label>
                <select className="form-control mb-4" {...register("c-active")} defaultValue="">
                  {['true', 'false'].map((option, index) => <option key={index}>{option}</option>)}
                </select>
                {errors['c-description'] && <p className="text-danger text-center">Error</p>}
                <textarea 
                  {...register("c-description")}
                  className="form-control"
                  placeholder="Description"
                  rows="5"
                />
                <Row className="my-5">
                  <Button variant="success" type="submit" className="mx-auto" style={{width: '97%'}}>
                    Create Product
                    <CloudCheckFill className="ml-2 mb-1" size={14}/>
                  </Button>
                </Row>
              </Card.Body>
            </Form>
          </Accordion.Collapse>
        </Card>
      </Accordion>
      <div className="toastHolder" style={{position: 'fixed', top: '80px', right: '10px'}}>
        <Toast show={show} setShow={setShow} title='Product Created' body={<>
          <p><strong>You Added {modalData.name}</strong></p>
          <Button className="w-100" variant="info" href={`https://dashboard.stripe.com/test/products/${modalData.id}/edit`} target="_blank">Add image</Button>
        </>} />
        <Toast show={showUpdate} setShow={setShowUpdate} title='Product Updated' body={<>
          <p><strong>You Updated {modalData.name}</strong></p>
          <Button className="w-100" variant="info" href={`https://dashboard.stripe.com/test/products/${modalData.id}/edit`} target="_blank">Edit image</Button>
        </>} />
        <Toast show={showError} setShow={setShowError} title='Insufficient Privileges' error body={<>
          <p><strong>This account is not an Admin account</strong></p>
          <p>Please contact your system admin about getting your account changed to an Admin account</p>
          <Button className="w-100" variant="info" href="/contact">Contact</Button>
        </>} />
        <Toast show={showGenericError} setShow={setShowGenericError} title='Server Error' error body={<>
          <p><strong>Something went wrong.</strong></p>
          <p>Your request could not be completed, please contact your server admin.</p>
          <Button className="w-100" variant="info" href="/contact">Contact</Button>
        </>} />
      </div>
    </>
  )
}
