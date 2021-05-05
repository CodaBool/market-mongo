import React, { useState, useEffect }  from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import InputGroup from 'react-bootstrap/InputGroup'
import Modal from 'react-bootstrap/Modal'
import { getState, USA_STATES, SHIPPING_COST, SHIPPING_EST } from '../../constants'
import axios from 'axios'
// import { useRouter } from 'next/router'
import { CreditCard, ArrowRight, House, Building, Globe, GeoAlt, Signpost, PlusCircle, Envelope, HandIndexThumb, BoxSeam, PersonFill } from 'react-bootstrap-icons'
import { useForm, Controller } from 'react-hook-form'

export default function Shipping({ size, setLoadMsg, customer, scroll, shipping, setPage, setCustomer }) {
  const { handleSubmit, watch, errors, register, control, getValues, setValue, formState, trigger } = useForm()
  const [show, setShow] = useState(false)
  const [mis, setMis] = useState({})
  // const router = useRouter()

  function autoFillState(postal_code) {
    const state = getState(postal_code)
    if (state) setValue('state', state)
  }
  
  useEffect(() => autoFillState(watch('postal_code')), [watch])
  useEffect(() => {
    if (shipping?.postal_code) {
      autoFillState(shipping.postal_code)
      trigger()
    }
  }, [])

  const onSubmit = async (data) => {
    autoFillState(data.postal_code)
    let mismatch = {}
    const newShipping = {
      name: data.name,
      address: {
        line1: data.line1,
        line2: data.line2,
        postal_code: data.postal_code,
        city: data.city,
        state: data.state
      }
    }
    // console.log('shipping', shipping, ' | new', newShipping)
    if (shipping) {
      if (data.name.trim() !== shipping.name) {
        mismatch.name = data.name.trim()
      }
      if (data.line1.trim().toLowerCase() !== shipping.address.line1.toLowerCase()) {
        mismatch.line1 = data.line1.trim().toLowerCase()
      }
      if (data.line2.trim().toLowerCase() !== shipping.address.line2.toLowerCase()) {
        mismatch.line2 = data.line2.trim().toLowerCase()
      }
      if (data.postal_code.trim() !== shipping.address.postal_code) {
        mismatch.postal_code = Number(data.postal_code.trim())
      }
      if (data.city.trim().toLowerCase() !== shipping.address.city.toLowerCase()) {
        mismatch.city = data.city.trim().toLowerCase()
      }
      if (data.state.trim().toLowerCase() !== shipping.address.state.toLowerCase()) {
        mismatch.state = data.state.trim().toLowerCase()
      }
      if (Object.keys(mismatch).length > 0) {
        setShow(true)
        setMis(mismatch)
        return
      }
    }
    saveShipping(newShipping)
  }
  
  async function saveShipping(data) {
    setLoadMsg('Creating Shipment')
    scroll()
    if (data === 'replace') { // use newly entered data
      data = {
        name: getValues("name"),
        address: {
          line1: getValues("line1"),
          line2: getValues("line2"),
          postal_code: getValues("postal_code"),
          city: getValues("city"),
          state: getValues("state")
        }
      }
    }
    if (data) {
      await axios.put('/api/customer', data)
        .then(res => setCustomer(res.data))
        .catch(err => console.log(err.response.data.msg))
        .catch(console.log)
    }
    setPage('payment')
  }

  return <>
    <Modal show={show} onHide={() => setShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Shipping Address Update</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>We have a different saved shipping address. Are you sure you would like to update your address information?</p>
        {Object.keys(mis).map(miss => (
          <div key={miss}>
            {miss === 'name' && <p><span className="text-muted mr-3">Name: </span>{shipping.name}<ArrowRight className="mx-3" size={14}/>{mis[miss]}</p>}
            {miss === 'line1' && <p><span className="text-muted mr-3">Line 1: </span>{shipping.address.line1}<ArrowRight className="mx-3" size={14}/>{mis[miss]}</p>}
            {miss === 'line2' && <p><span className="text-muted mr-3">Line 2: </span>{shipping.address.line2}<ArrowRight className="mx-3" size={14}/>{mis[miss]}</p>}
            {miss === 'postal_code' && <p><span className="text-muted mr-3">Zip: </span>{shipping.address.postal_code}<ArrowRight className="mx-3" size={14}/>{mis[miss]}</p>}
            {miss === 'city' && <p><span className="text-muted mr-3">City: </span>{shipping.address.city}<ArrowRight className="mx-3" size={14}/>{mis[miss]}</p>}
            {miss === 'state' && <p><span className="text-muted mr-3">State: </span>{shipping.address.state}<ArrowRight className="mx-3" size={14}/>{mis[miss].toUpperCase()}</p>}
          </div>
        ))}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => {saveShipping(); setShow(false)}}>Keep Old Address</Button>
        <Button variant="success" onClick={() => {saveShipping('replace'); setShow(false)}}>Update Address</Button>
      </Modal.Footer>
    </Modal >
    <Form className="mt-5" onSubmit={handleSubmit(onSubmit)}>
      <Accordion defaultActiveKey="0">
        <Card>
          <Accordion.Toggle as={Card.Header}>
            Shipping <House style={{marginLeft: '10px', marginBottom: '9px'}} size={28}/>
            <p className="float-right" style={{fontSize: '0.8em'}}>
              {Object.keys(errors).length > 0 && <>{`${Object.keys(errors).length} items left`}<PlusCircle className="ml-2 mb-1" size={18}/></>} 
            </p>
          </Accordion.Toggle>
          <Accordion.Collapse className="show">
            <Card.Body className="px-2">
              
              {/* Name */}
              <InputGroup className="my-3">
                <span className={`${errors.line1 && 'bg-danger'}`} style={{width: '10px', height: '40px'}}></span>
                <InputGroup.Prepend>
                  <InputGroup.Text><PersonFill className="mr-2 d-inline" size={18}/>Name</InputGroup.Text>
                </InputGroup.Prepend>
                <Controller
                  as={<Form.Control />} 
                  control={control}
                  name="name"
                  defaultValue={`${shipping ? shipping.name : ''}`}
                  placeholder="Name" 
                  required
                  rules={{
                    validate: () => {
                      if (getValues("name").length < 4) return false
                    }
                  }}
                />
              </InputGroup>

              {/* Address Line 1*/}
              <InputGroup className="my-3">
                <span className={`${errors.line1 && 'bg-danger'}`} style={{width: '10px', height: '40px'}}></span>
                <InputGroup.Prepend>
                  <InputGroup.Text><GeoAlt className="mr-2 d-inline" size={18}/>Line 1</InputGroup.Text>
                </InputGroup.Prepend>
                <Controller 
                  as={<Form.Control />} 
                  control={control}
                  name="line1"
                  defaultValue={`${shipping ? shipping.address.line1 : ''}`}
                  placeholder="Address Line 1" 
                  required
                  rules={{
                    validate: () => { // validate that has a number, least 4 chars, has a space
                      const val = getValues("line1")
                      if (!/\d/.test(val) || val.length < 4 || !/\s/.test(val)) return false
                    }
                  }}
                />
              </InputGroup>

              {/* Address Line 2 */}
              <InputGroup className="my-3">
                <span style={{width: '10px'}}></span>
                <InputGroup.Prepend>
                  <InputGroup.Text><GeoAlt className="mr-2 d-inline" size={18}/>Line 2</InputGroup.Text>
                </InputGroup.Prepend>
                <Controller 
                  as={<Form.Control />} 
                  control={control}
                  name="line2"
                  defaultValue={`${shipping ? shipping.address.line2 : ''}`}
                  placeholder="Address Line 2"
                />
              </InputGroup>

              {/* Postal Code */}
              <InputGroup className="my-3">
                <span className={`${errors.postal_code && 'bg-danger'}`} style={{width: '10px', height: '40px'}}></span>
                <InputGroup.Prepend>
                  <InputGroup.Text style={{paddingRight: '32px'}}>
                    <Signpost className="mr-2 d-inline" size={18}/>Zip
                  </InputGroup.Text>
                </InputGroup.Prepend>
                <Controller 
                  as={<Form.Control />} 
                  control={control}
                  name="postal_code"
                  defaultValue={`${shipping ? shipping.address.postal_code : ''}`}
                  placeholder="Zip"
                  required
                  rules={{
                    validate: () => { // validate that postal_code is just numbers and 5 digits
                      const val = getValues("postal_code")
                      if (val.length !== 5 || !val.match(/^[0-9]+$/)) return false
                    }
                  }}
                />
                </InputGroup>

              {/* City */}
              <InputGroup className="my-3">
                <span className={`${errors.city && 'bg-danger'}`} style={{width: '10px', height: '40px'}}></span>
                <InputGroup.Prepend>
                  <InputGroup.Text style={{paddingRight: '27px'}}>
                    <Building className="mr-2 d-inline" size={18}/>City
                  </InputGroup.Text>
                </InputGroup.Prepend>
                <Controller 
                  as={<Form.Control />} 
                  control={control}
                  name="city"
                  defaultValue={`${shipping ? shipping.address.city : ''}`}
                  placeholder="City"
                  required
                  rules={{
                    validate: () => { // validate that city is only chars and at least 4 chars ^[ A-Za-z]+$
                      const val = getValues("city")
                      if (!/^[ A-Za-z]+$/.test(val) || val.length < 4) return false
                    }
                  }}
                  />
              </InputGroup>

              {/* State */}
              <InputGroup className="my-3">
                <span style={{width: '10px'}}></span>
                <InputGroup.Prepend>
                  <InputGroup.Text style={{paddingRight: '19px'}}>
                    <Globe className="mr-2 d-inline" size={18}/>State
                  </InputGroup.Text>
                </InputGroup.Prepend>
                <select className="form-control" name="state" defaultValue="" ref={register}>
                  {USA_STATES.map((option, index) => <option key={index}>{option}</option>)}
                </select>
              </InputGroup>

            </Card.Body>
          </Accordion.Collapse>
        </Card>
        <Card>
          <Accordion.Toggle as={Card.Header} >
            Shipping<BoxSeam style={{marginLeft: '20px', marginBottom: '4px'}} size={28}/>
            {/* <p className="float-right" style={{fontSize: '0.8em'}}>
              {!formState.isValid && <>Click To See more<HandIndexThumb className="translating" style={{marginLeft: '15px', marginBottom: '4px'}} size={20}/></>}
            </p> */}
          </Accordion.Toggle>
          <Accordion.Collapse className="show">
            <Card.Body className="p-5">
              <input type="radio" ref={register} checked name="shipping" required defaultValue="priority" readOnly />
              <h5 className="d-inline ml-4">$ {SHIPPING_COST} USPS Priority Mail</h5>
              <InputGroup.Text className="mt-4">
                <Envelope style={{marginRight: '15px'}} size={22}/>{SHIPPING_EST}
              </InputGroup.Text>
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
      <Row>
        <Button className="mx-auto my-5" style={{width: "94%"}} variant="primary" type="submit">Add Payment <CreditCard className="ml-2" size={14}/></Button>
      </Row>
    </Form>
  </>
}