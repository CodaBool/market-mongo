import React, { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form'
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Toast from '../../components/Toast'
import useDebounce from '../../constants/useDebounce'
import { CATEGORY } from '../../constants'
import axios from 'axios'
import FormControl from 'react-bootstrap/FormControl'
import InputGroup from 'react-bootstrap/InputGroup'
import { useSession, signIn } from 'coda-auth/client'
import { Load, isLoad } from '../../components/Load'
import BoxImg from '../../components/UI/BoxImg'
import { useForm, Controller } from 'react-hook-form'
import { ImageFill, CloudCheckFill, ArrowClockwise } from 'react-bootstrap-icons'

export default function admin() {
  const [session, loading] = useSession()
  const [show, setShow] = useState(false)
  const [showError, setShowError] = useState(false)
  const [showGenericError, setShowGenericError] = useState(false)
  const [products, setProducts] = useState(null)
  const [product, setProduct] = useState(null)
  const [showUpdate, setShowUpdate] = useState(false)
  const [loadProduct, setLoadProduct] = useState(false)
  const [uid, setUid] = useState('')
  const debounce = useDebounce(uid, 1000)
  const [createRes, setCreateRes] = useState({metadata: {quantity: undefined, price: undefined}})
  const { handleSubmit, control, register, watch, setValue, getValues, reset } = useForm()
  
  useEffect(() => setUid(watch('u-id')), [watch])
  useEffect(() => fillData(uid), [debounce])

  if (isLoad(session, loading, true)) return <Load />

  const onUpdateSubmit = (data) => {
    const categories = String(data['u-categories'])
    const metadata = {currency: data['u-currency'], price: data['u-price'], quantity: data['u-quantity'], categories}
    for (const key in metadata) metadata[key] === '' && delete metadata[key]
    const product = { active: data['u-active'], name: data['u-name'], description: data['u-description'], metadata}
    for (const key in product) product[key] === '' && delete product[key]
    axios.post('/api/stripe/admin/updateProduct', {id: data['u-id'], product})
      .then(res => {
        console.log('return', res.data)
        reset()
        setCreateRes(res.data)
        setShowUpdate(true)
      })
      .catch(err => {
        console.log(err.response.data)
        if (err.response.data === 'Not an admin') {
          setShowError(true)
        } else {
          setShowGenericError(true)
        }
      })
  }
      
  const onCreateSubmit = (data) => {
    const categories = String(data['c-categories'])
    const metadata = {currency: data['c-currency'], price: data['c-price'], quantity: data['c-quantity'], categories}
    const product = { active: data['c-active'], name: data['c-name'], description: data['c-description'], type: data['c-type'],metadata}

    axios.post('/api/stripe/admin/putProduct', product)
      .then(res => {
        console.log('return', res.data)
        reset()
        setCreateRes(res.data)
        setShow(true)
      })
      .catch(err => {
        console.log(err.response.data)
        if (err.response.data === 'Not an admin') {
          setShowError(true)
        } else {
          setShowGenericError(true)
        }
      })
  }

  function getProducts(active) {
    axios.get('/api/admin/product', { params: { active }})
      .then(res => setProducts(res.data))
      .catch(err => console.log(err))
  }

  function fillData() {
    console.log('bounced | id =', uid)
    if (uid) {
      setLoadProduct(true)
      axios.get('/api/admin/product', { params: {id: uid} })
        .then(res => {
          console.log('product', res.data)
          setProduct(res.data)
          setValue('u-name', `${res.data.name ? res.data.name : ''}`)
          setValue('u-active', `${res.data.active ? res.data.active : ''}`)
          setValue('u-price', `${res.data.metadata.price ? res.data.metadata.price : ''}`)
          setValue('u-currency', `${res.data.metadata.currency ? res.data.metadata.currency : ''}`)
          setValue('u-quantity', `${res.data.metadata.quantity ? res.data.metadata.quantity : ''}`)
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
      <Card>
        <Accordion.Toggle as={Card.Header} eventKey="0">
          See Products
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
                <Card key={product.id} className="m-2">
                  {/* {product.images[0] 
                    ? <img src={product.images[0]} alt={product.name} style={{width: '150px'}} />
                    : <div className="border p-4" style={{width: '150px', height: '150px'}}>No Image Added 😔</div>
                  } */}
                  <BoxImg stripeProduct={product} alt={product.name} />
                  <h6>Name: {product.name}</h6>
                  <h6>ID: {product.id}</h6>
                  <h6>description: {product.description}</h6>
                  <h6>active: <p className={`${product.active ? 'text-success' : 'text-danger'} d-inline`}>{product.active ? 'Active' : 'Archived'}</p></h6>
                  <Button href={`https://dashboard.stripe.com/test/products/${product.id}/edit`} target="_blank" variant="outline-primary">Edit Image</Button>
                  <h6>price: {product.metadata.price}</h6>
                  <h6>quantity: {product.metadata.quantity}</h6>
                  <h6>currency: {product.metadata.currency}</h6>
                  <h6>categories: {product.metadata.categories}</h6>
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
              <Form.Group>
                <Form.Label>ID</Form.Label>
                <Controller 
                  as={<Form.Control />} 
                  control={control} 
                  name="u-id"
                  defaultValue=""
                  placeholder="prod_12345678912345"
                  required
                />
              </Form.Group>
              {true
                ? <>
                    <Form.Group>
                      <Form.Label>Name</Form.Label>
                      <Controller 
                        as={<Form.Control />} 
                        control={control} 
                        name="u-name"
                        defaultValue=""
                        placeholder="Name"
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Categories (hold Control [Windows] or Command [Mac] to select multiple, Control/Command to unselect)</Form.Label>
                      <select multiple className="form-control" ref={register} defaultValue={[]} name="u-categories">
                        {CATEGORY.map((option, index) => <option key={index}>{option}</option>)}
                      </select>
                    </Form.Group>
                    <Form.Label>Active</Form.Label>
                    <select className="form-control" ref={register} defaultValue="" name="u-active">
                      {['true', 'false'].map((option, index) => <option key={index}>{option}</option>)}
                    </select>
                    <Form.Label>Price in Pennies</Form.Label>
                    <InputGroup>
                      <InputGroup.Prepend>
                        <InputGroup.Text>$</InputGroup.Text>
                      </InputGroup.Prepend>
                      <Controller 
                        as={<FormControl aria-label="Amount (to the nearest dollar)" />} 
                        control={control} 
                        name="u-price"
                        defaultValue=""
                        placeholder="Price in Pennies"
                      />
                    </InputGroup>
                    <Form.Label>Currency</Form.Label>
                    <select className="form-control" ref={register} defaultValue="" name="u-currency">
                      {['usd'].map((option, index) => <option key={index}>{option}</option>)}
                    </select>
                    <Form.Group>
                      <Form.Label>Quantity</Form.Label>
                      <Controller 
                        as={<Form.Control />} 
                        control={control} 
                        name="u-quantity"
                        defaultValue=""
                        placeholder="Quantity"
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Description</Form.Label>
                      <Controller 
                        as={<Form.Control as="textarea" />} 
                        control={control} 
                        name="u-description"
                        rows="5"
                        defaultValue=""
                        placeholder="Description"
                      />
                    </Form.Group>
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
                : <h4 className="text-center text-muted my-2">Enter an ID to update a Product</h4>
              }
              {loadProduct && <Load />}
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
                <Form.Group>
                  <Form.Label>Name</Form.Label>
                  <Controller 
                    as={<Form.Control />} 
                    control={control} 
                    name="c-name"
                    defaultValue=""
                    placeholder="Name"
                    required
                    />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Categories (hold Control [Windows] or Command [Mac] to select multiple, Control/Command to unselect)</Form.Label>
                  <select multiple className="form-control" ref={register} defaultValue={[]} name="c-categories">
                    {CATEGORY.map((option, index) => <option key={index}>{option}</option>)}
                  </select>
                </Form.Group>
                <Form.Label>Type</Form.Label>
                <select className="form-control" ref={register} defaultValue="" name="c-type">
                  {['good'].map((option, index) => <option key={index}>{option}</option>)}
                </select>
                <Form.Label>Active</Form.Label>
                <select className="form-control" ref={register} defaultValue="" name="c-active">
                  {['true', 'false'].map((option, index) => <option key={index}>{option}</option>)}
                </select>
                <Form.Label>Price in Pennies</Form.Label>
                <InputGroup>
                  <InputGroup.Prepend>
                    <InputGroup.Text>$</InputGroup.Text>
                  </InputGroup.Prepend>
                  <Controller 
                    as={<FormControl aria-label="Amount (to the nearest dollar)" />} 
                    control={control} 
                    name="c-price"
                    defaultValue=""
                    placeholder="Price in Pennies"
                  />
                </InputGroup>
                <Form.Label>Currency</Form.Label>
                <select className="form-control" ref={register} defaultValue="" name="c-currency">
                  {['usd'].map((option, index) => <option key={index}>{option}</option>)}
                </select>
                <Form.Group>
                  <Form.Label>Quantity</Form.Label>
                  <Controller 
                    as={<Form.Control />} 
                    control={control} 
                    name="c-quantity"
                    defaultValue=""
                    placeholder="Quantity"
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Controller 
                    as={<Form.Control as="textarea" />} 
                    control={control} 
                    name="c-description"
                    rows="5"
                    defaultValue=""
                    placeholder="Description"
                  />
                </Form.Group>
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
      <div style={{position: 'fixed', top: '80px', right: '10px'}}>
        <Toast show={show} setShow={setShow} title='Product Created' body={<>
          <p><strong>You Added {createRes.name}</strong></p>
          {createRes.metadata.quantity !== undefined && <p>Quantity: {createRes.metadata.quantity}</p>}
          {createRes.metadata.price !== undefined && <p>Price (pennies): {createRes.metadata.price}</p>}
          <Button className="w-100" variant="info" href={`https://dashboard.stripe.com/test/products/${createRes.id}/edit`} target="_blank">Add image</Button>
        </>} />
        <Toast show={showUpdate} setShow={setShowUpdate} title='Product Updated' body={<>
          <p><strong>You Updated {createRes.name}</strong></p>
          {createRes.metadata.quantity !== undefined && <p>Quantity: {createRes.metadata.quantity}</p>}
          {createRes.metadata.price !== undefined && <p>Price (pennies): {createRes.metadata.price}</p>}
          <Button className="w-100" variant="info" href={`https://dashboard.stripe.com/test/products/${createRes.id}/edit`} target="_blank">Edit image</Button>
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
