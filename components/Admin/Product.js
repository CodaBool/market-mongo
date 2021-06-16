import { useState, useEffect, useRef } from 'react'
import { XSquare, Calendar3, ArrowClockwise, PlusSquare, ArrowLeft, EmojiDizzy, X } from 'react-bootstrap-icons'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { format } from 'timeago.js'
import Toast from '../UI/Toast'
import { Load } from '../Load'
import useDebounce from '../../constants/useDebounce'

const Label = ({title}) => <InputGroup.Text style={{width: '8.2rem'}}>{title}</InputGroup.Text>

export default function Variants() {
  const [products, setProducts] = useState()
  const [product, setProduct] = useState()
  const [showCreateForm, setShowCreateForm] = useState()
  const [flip, setFlip] = useState(false)

  useEffect(() =>  {
    setFlip(true)
    setTimeout(() => setFlip(false), 1000)
  }, [products])

  useEffect(() =>  {
    getProducts()
  }, [])

  function getProducts(refresh) {
    axios.get('/api/admin/mongo/product')
      .then(res => {
        setProducts(res.data)
        if (refresh) {
          // TODO: uncomment
          // console.log(res.data)
          setProduct(res.data.find(prod => prod._id === product._id))
        }
      })
      .catch(err => console.error(err.response.data.msg))
      .catch(console.log)
  }

  if (product) return <Editor product={product} setProduct={setProduct} getProducts={getProducts} />
  if (showCreateForm) return <CreateForm setShowCreateForm={setShowCreateForm} getProducts={getProducts} />

  return (
    <>
      <h1 className="display-4">
        Products 
        <ArrowClockwise size={26} className={`${flip && 'flip'} sway-on-hover ml-3`} onClick={getProducts} fill="#0069d9" />
        <PlusSquare className="spin-on-hover ml-3" size={26} fill="#0069d9" onClick={() => setShowCreateForm(true)} />
      </h1>

      {products === undefined && <Load msg="Getting products" />}
      {products?.length == 0 && <p className="m-5"><EmojiDizzy className="mr-2" size={25} />No Products Found</p>}
      {products?.length > 0 && 
        <>
          <p>Select a product from below to view its variants</p>
          {products.map(product => (
            <img key={product._id} src={product.coverImg} width="150px" height="150px" className="m-2 hover-effect" onClick={() => setProduct(product)} />
          ))}
        </>
      }
    </>
  )
}

function CreateForm({ setShowCreateForm, getProducts }) {
  const { handleSubmit, formState:{ errors }, setError, clearErrors, control, getValues, register, reset, setValue, watch } = useForm()

  const onSubmit = data => {
    console.log('submit with data =', data)
    
    axios.post('/api/admin/mongo/product', {
      _id: data['id'],
      active: data['active'],
      description: data['description'],
      coverImg: data['image'],
      variants: [{
        quantity: data['quantity'],
        images: [data['image']],
        price: data['price'],
        name: data['name'],
        default: true
      }]
    })
      .then(res => {
        getProducts(true)
        console.log('create', res.data)
        setShowCreateForm()
        reset()
      })
      .catch(console.log)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
      <Button variant="light" className="rounded-circle mb-5 border" onClick={() => setShowCreateForm()} style={{width: '3rem', height: '3rem'}}>
        <ArrowLeft className="mb-1" size={18} />
      </Button>
      <Card className="rounded shadow p-4">
        <InputGroup>
          <Label title="ID" />
          <input className="form-control" defaultValue="" {...register("id")} required />
        </InputGroup>
        <InputGroup>
          <Label title="Active" />
          <select className="form-control" {...register("active")} defaultValue="true">
            {['true', 'false'].map((option, index) => <option key={index}>{option}</option>)}
          </select>
        </InputGroup>
        <InputGroup>
          <Label title="Image URL" />
          <input className="form-control" defaultValue="" {...register("image")} required />
        </InputGroup>
        <InputGroup>
          <Label title="Name" />
          <input className="form-control" defaultValue="" {...register("name")} required />
        </InputGroup>
        <InputGroup>
          <Label title="Price" />
          <input className="form-control" defaultValue="" {...register("price")} required />
        </InputGroup>
        <InputGroup>
          <Label title="Quantity" />
          <input className="form-control" defaultValue="" {...register("quantity")} required />
        </InputGroup>
        <InputGroup>
          <Label title="Description" />
          <textarea className="form-control" defaultValue="" {...register("description")} required />
        </InputGroup>
        <Button type="submit" className="my-3">Create</Button>
      </Card>
    </form>
  )
}

function CreateVariantForm({ setShowCreate, _id, getProducts }) {
  const { handleSubmit, formState:{ errors }, setError, clearErrors, control, getValues, register, reset, setValue, watch } = useForm()

  const onSubmit = data => {
    axios.put('/api/admin/mongo/product', { data, _id, create: true })
      .then(res => {
        console.log('create', res.data)
        setShowCreate(false)
        getProducts(true)
        reset()
      })
      .catch(err => console.error(err.response.data.msg))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h4 className="display-4 my-3">New Variant <XSquare className="spin-on-hover ml-4" size={26} fill="#dc3545" onClick={() => setShowCreate(false)} /></h4>

      <InputGroup>
        {errors.name && <p>Error</p>}
        <Label title="Name" />
        <input className="form-control" defaultValue="" {...register("name")} required />
      </InputGroup>

      <InputGroup>
      {errors.default && <p>Error</p>}
        <Label title="Default" />
        <select className="form-control" {...register("default")} defaultValue="false">
          {['true', 'false'].map((option, index) => <option key={index}>{option}</option>)}
        </select>
      </InputGroup>

      <InputGroup>
      {errors.price && <p>Error</p>}
        <Label title="Price in Pennies" />
        <input className="form-control" defaultValue="" {...register("price")} required />
      </InputGroup>

      <InputGroup>
      {errors.quantity && <p>Error</p>}
        <Label title="Quantity" />
        <input className="form-control" defaultValue="" {...register("quantity")} required />
      </InputGroup>

      {[0, 1, 2, 3, 4].map(value => (
        <InputGroup key={value}>
          <InputGroup.Text style={{width: '8.2rem'}}>Image URL {value + 1}</InputGroup.Text>
          <input className="form-control" defaultValue="" {...register("img-" + value)} />
        </InputGroup>
      ))}
      <Button type="submit" variant="success" className="w-100">Create Variant</Button>
    </form>
  )
}

function Editor({ product, setProduct, getProducts }) {
  const [showCreate, setShowCreate] = useState()
  const [showModal, setShowModal] = useState()
  const { handleSubmit, formState:{ errors }, setError, clearErrors, control, getValues, register, reset, setValue, watch } = useForm()

  const onSubmit = data => {
    console.log('submit with data =', data, product)
    axios.put('/api/admin/mongo/product', { _id: product._id, data })
      .then(res => {
        console.log('update success', res.data)
        getProducts(true)
      })
      .catch(err => console.error(err.response.data.msg))
  }
  
  function removeVariant() {
    setShowModal(false)
    axios.put('/api/admin/mongo/product', { _id: product._id, variantId: showModal._id, delete: true })
      .then(res => {
        console.log('delete success')
        getProducts(true)
      })
      .catch(err => console.error(err.response.data.msg))
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
        <Button variant="light" className="rounded-circle mb-5 border" onClick={() => setProduct()} style={{width: '3rem', height: '3rem'}}>
          <ArrowLeft className="mb-1" size={18} /> 
        </Button>
        <Card className="rounded shadow p-4">
          <p className="text-muted">Updated {format(product.updatedAt)}</p>
          <InputGroup>
            <Label title="ID" />
            <input className="form-control" defaultValue={product._id} {...register("_id")} />
          </InputGroup>
          <InputGroup>
            <Label title="Currency" />
            <input className="form-control" defaultValue={product.currency} {...register("currency")} />
          </InputGroup>
          <InputGroup>
            <Label title="Description" />
            <textarea className="form-control" defaultValue={product.description} {...register("description")} />
          </InputGroup>
          <InputGroup>
            <Label title="Active" />
            <select className="form-control" {...register("active")} defaultValue={product.active}>
              {['true', 'false'].map((option, index) => <option key={index}>{option}</option>)}
            </select>
          </InputGroup>
          <InputGroup>
            <Label title="Livemode" />
            <select className="form-control" {...register("livemode")} defaultValue={product.livemode}>
              {['true', 'false'].map((option, index) => <option key={index}>{option}</option>)}
            </select>
          </InputGroup>
          <div className="d-flex" style={{flexWrap: 'wrap', flexDirection: 'row'}}>
            <InputGroup>
              <Label title={<img className="mx-auto" src={product.coverImg} width="90px" height="90px" />} />
              <textarea className="form-control" defaultValue={product.coverImg} {...register("coverImg")} />
            </InputGroup>
          </div>
          <hr />
          <h3>Variants <PlusSquare className="spin-on-hover ml-4" size={26} fill="#0069d9" onClick={() => setShowCreate(true)} /></h3>
          {product.variants.map((variant, index) => (
            <Card className="rounded p-2" key={variant._id}>

              <X className="x-icon ml-auto" onClick={() => setShowModal({_id: variant._id, name: variant.name})}  size={42}/>

              <input hidden defaultValue={variant._id} {...register("id-" + index)} />

              <InputGroup>
                <Label title="Name" />
                <input className="form-control" defaultValue={variant.name} {...register("name-" + index)} />
              </InputGroup>

              <InputGroup>
                <Label title="Default" />
                <select className="form-control" {...register("default-" + index)} defaultValue={variant.default}>
                  {['true', 'false'].map((option, index) => <option key={index}>{option}</option>)}
                </select>
              </InputGroup>

              <InputGroup>
                <Label title="Price in Pennies" />
                <input className="form-control" defaultValue={variant.price} {...register("price-" + index)} />
              </InputGroup>

              <InputGroup>
                <Label title="Quantity" />
                <input className="form-control" defaultValue={variant.quantity} {...register("quantity-" + index)} />
              </InputGroup>
              
              {[0, 1, 2, 3, 4].map(indexInner => (
                <InputGroup key={indexInner}>
                  {variant.images[indexInner] 
                    ? <Label title={<img className="mx-auto" src={variant.images[indexInner]} width="90px" height="90px" />} />
                    : <Label title={<p className="mx-auto">No Image</p>} />
                  }
                  <textarea className="form-control" defaultValue={variant.images[indexInner] || ''} {...register("img-" + index + '-' + indexInner)} />
                </InputGroup>
              ))}

            </Card>
          ))}
          <Button type="submit" variant="success">Update</Button>
        </Card>
      </form>
      {showCreate && <CreateVariantForm setShowCreate={setShowCreate} _id={product._id} getProducts={getProducts} />}
      <Modal show={!!showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Product Variant</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you would like to <strong>delete</strong> variant <strong>{showModal?.name}</strong>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={removeVariant}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}