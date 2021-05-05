import axios from 'axios'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Accordion from 'react-bootstrap/Accordion'
import Row from 'react-bootstrap/Row'
import FormControl from 'react-bootstrap/FormControl'
import Toast from '../Toast'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import { PlusSquare, XSquare, Calendar3, ArrowClockwise, ImageFill, CloudCheckFill } from 'react-bootstrap-icons'
import { useForm, Controller } from 'react-hook-form'
import { useState, useEffect, useRef } from 'react'
import useDebounce from '../../constants/useDebounce'
import BoxImg from '../UI/BoxImg'

export default function Product() {
  const { handleSubmit, control, register, watch, setValue, getValues, reset } = useForm()
  const [products, setProducts] = useState([])
  const [update, setUpdate] = useState({_id: '', data: {}})
  const [flip, setFlip] = useState(false)

  // modal state
  const [showError, setShowError] = useState(false)
  const [showUpdate, setShowUpdate] = useState(false)
  const [loadProduct, setLoadProduct] = useState(false)
  const [showGenericError, setShowGenericError] = useState(false)
  const [show, setShow] = useState(false)
  const [modalUpdateData, setModalUpdateData] = useState({})
  const [modalData, setModalData] = useState({quantity: undefined, price: undefined})

  // fill update form after 1s of no input from the ID field
  const [uid, setUid] = useState('')
  const debounce = useDebounce(uid, 1000)
  useEffect(() => setUid(watch('u-id')), [watch])
  useEffect(() => fillData(), [debounce])

  const onUpdateSubmit = (data) => {
    console.log('submit with data =', data)
    axios.put('/api/product', {_id: uid, data: {
      name: data['u-name'],
      active: data['u-active'],
      price: data['u-price'],
      quantity: data['u-quantity'],
      images:  data['u-image'] && ['https://files.stripe.com/links/' + data['u-image']],
      description: data['u-description']
    }})
      .then(res => {
        setModalUpdateData({
          name: data['u-name'],
          quantity: data['u-quantity'],
          price: data['u-price'],
          id: uid
        })
        console.log(res.data)
        getProducts()
        setShowUpdate(true)
      })
      .catch(err => console.error('put err', err.response.data.msg))
  }

  const onCreateSubmit = (data) => {
    axios.post('/api/product', {
      _id: data['c-id'],
      name: data['c-name'],
      active: data['c-active'],
      price: data['c-price'],
      quantity: data['c-quantity'],
      images: data['c-image'] && ['https://files.stripe.com/links/' + data['c-image']],
      description: data['c-description']
    })
      .then(res => {
        getProducts()
        console.log('create', res.data)
        setModalData({
          name: data['c-name'],
          active: data['c-active'],
          price: data['c-price'],
          quantity: data['c-quantity'],
          description: data['c-description'],
          id: data['c-id']
        })
        setShow(true)
        reset()
      })
      .catch(err => console.error('post err', err.response.data.msg))
  }

  function fillData() {
    axios.get('/api/product', {params: {_id: uid}})
      .then(res => {
        // console.log(res.data)
        setValue('u-name', `${res.data.name ? res.data.name : ''}`)
        setValue('u-active', `${res.data.active ? res.data.active : ''}`)
        setValue('u-price', `${res.data.price ? res.data.price : ''}`)
        setValue('u-quantity', `${res.data.quantity ? res.data.quantity : ''}`)
        setValue('u-description', `${res.data.description ? res.data.description : ''}`)
        setValue('u-image', `${res.data.images ? res.data.images[0].slice(31) : ''}`)
      })
      .catch(err => console.error(err))
  }

  useEffect(() =>  {
    setFlip(true)
    setTimeout(() => setFlip(false), 1000)
  }, [products])

  useEffect(() =>  {
    getProducts()
  }, [])

  function getProducts() {
    axios.get('/api/product')
      .then(res => setProducts(res.data))
      .catch(err => console.error('get err', err.response.data.msg))
  }

  return (
    <Accordion className="my-5" defaultActiveKey="0">
      <h1 className="display-4">Mongo <ArrowClockwise size={26} className={`${flip && 'flip'} sway-on-hover`} onClick={getProducts} fill="#0069d9" /></h1>
      <Card>
        <Accordion.Toggle as={Card.Header} eventKey="0">
          Products
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="0" className="expandable">
          <Row className="m-2">
            {products.length > 0 && products.map(product => (
              <Card key={product._id} className="m-2" style={{maxWidth: '250px'}}>
                <BoxImg imageUrl={product.images[0]} alt={product.name} small />
                <p className="text-muted text-center">Image Can be Misleading</p>
                <h6><strong>ID: </strong> {product._id}</h6>
                <h6><strong>Name: </strong> {product.name}</h6>
                <h6><strong>description: </strong> {product.description}</h6>
                <h6><strong>active: </strong> <p className={`${product.active ? 'text-success' : 'text-danger'} d-inline`}>{product.active ? 'Active' : 'Archived'}</p></h6>
                <h6><strong>livemode: </strong> <p className={`${product.livemode ? 'text-success' : 'text-danger'} d-inline`}>{product.livemode ? 'True' : 'False'}</p></h6>
                <h6><strong>price: </strong> {product.price}</h6>
                <h6><strong>quantity: </strong> {product.quantity}</h6>
              </Card>
            ))}
          </Row>
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
                <>
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
                    <Form.Label>Image ID</Form.Label>
                    <Controller 
                      as={<Form.Control />} 
                      control={control} 
                      name="u-image"
                      defaultValue=""
                      placeholder="fl_test_somethinglikethis"
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
              {/* {loadProduct && <Load />} */}
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
                <>
                  <Form.Group>
                    <Form.Label>Stripe Product ID</Form.Label>
                    <Controller 
                      as={<Form.Control />} 
                      control={control} 
                      name="c-id"
                      defaultValue=""
                      placeholder="prod_12345678912345"
                      required
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Name</Form.Label>
                    <Controller 
                      as={<Form.Control />} 
                      control={control} 
                      name="c-name"
                      defaultValue=""
                      placeholder="Name"
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Image ID</Form.Label>
                    <Controller 
                      as={<Form.Control />} 
                      control={control} 
                      name="c-image"
                      defaultValue=""
                      placeholder="fl_test_somethinglikethis"
                    />
                  </Form.Group>
                  <Form.Label>Active</Form.Label>
                  <select className="form-control" ref={register} defaultValue="true" name="c-active">
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
                </>
            </Card.Body>
          </Form>
        </Accordion.Collapse>
      </Card>
      <div style={{position: 'fixed', top: '80px', right: '10px'}}>
        <Toast show={show} setShow={setShow} title='Product Created' body={<>
          <p><strong>You Added {modalData.name}</strong></p>
          {modalData.quantity && <p>Quantity: {modalData.quantity}</p>}
          {modalData.price && <p>Price (pennies): {modalData.price}</p>}
          <Button className="w-100" variant="info" href={`https://dashboard.stripe.com/test/products/${modalData.id}/edit`} target="_blank">Add image</Button>
        </>} />
        <Toast show={showUpdate} setShow={setShowUpdate} title='Product Updated' body={<>
          <p><strong>You Updated {modalUpdateData.name}</strong></p>
          {modalUpdateData.quantity && <p>Quantity: {modalUpdateData.quantity}</p>}
          {modalUpdateData.price && <p>Price (pennies): {modalUpdateData.price}</p>}
          <Button className="w-100" variant="info" href={`https://dashboard.stripe.com/test/products/${modalUpdateData.id}/edit`} target="_blank">Edit image</Button>
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
    </Accordion>
  )
}
