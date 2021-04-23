import React, { useState, useEffect } from 'react'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Form from 'react-bootstrap/Form'
import { format } from 'timeago.js'
import axios from 'axios'
import bcrypt from 'bcryptjs'
import { useRouter } from 'next/router'
import { useSession } from 'coda-auth/client'
import { Load, isLoad } from '../../components/Load'

// serverside
import { connectDB, jparse } from '../../util/db'
import { getUserFromContext } from '../api/user'

export default function Index({ user }) {
  const [selector, setSelector] = useState('')
  const [newData, setNewData] = useState('')
  const [users, setUsers] = useState([])
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [reviews, setReviews] = useState([])
  const [intents, setIntents] = useState([])
  const [session, loading] = useSession()
  const router = useRouter()

  if (isLoad(session, loading, true)) return <Load />

  if (session.user.email !== 'coda@bool.com') {
    router.push('/')
    return <Load />
  }

  // if (user) {
  //   console.log('client user =', user)
  // }
  
  function getUser() { // res.data is an empty string if user not found
    axios.get('/api/user', { params: { email: '' } })
      .then(res => { if (res.data) setUsers([res.data]) })
      .catch(err => console.error(err.response.data.msg))
  }
  function getUsers() { // nothing in front end should be doing this operation
    axios.get('/api/admin/getAllUsers')
      .then(res => setUsers(res.data))
      .catch(err => console.error(err.response.data.msg))
  }

  function postUser() {
    bcrypt.hash('password', 10, (err, hash) => { // sets password to password
      axios.post('/api/user', {email: selector, password: hash, address: {
        name: 'Coda Bool',
        line1: '1234 Some Place',
        line2: '',
        postalCode: 12345,
        city: 'New York City',
        country: 'United States',
        state: 'NY',
        phone: '+11234567890'
      }})
        .then(res => {
          console.log('user added', res)
          getUsers() // gather all users
        })
        .catch(err => console.error(err.response.data.msg))
    })
  }

  function putUser(active = true) {
    console.log(selector, newData)
    if (active) { // update the email put
      axios.put('/api/user', { email: selector, data: {email: newData, active}})
        .then(res => console.log('put res', res))
        .catch(err => console.error('put err', err.response.data.msg))
    } else { // "delete" account (put active to false)
      axios.put('/api/user', { email: selector, data: { active }})
        .then(res => console.log('Delete res', res))
        .catch(err => console.error('Delete err', err.response.data.msg))
    }
  }

  function putCustomer() {
    const shipping = {
      name: 'Coda Bool',
      phone: '1231231234',
      address: {
        line1: '1112 Street',
        city: 'Orlando',
        country: 'US',
        line2: 'building 6, #4',
        postal_code: 12345,
        state: 'FL'
      }
    }
    axios.put('/api/customer', { id: selector, shipping})
      .then(res => console.log('put res', res))
      .catch(err => console.error('put err', err.response.data.msg))
  }

  function getCustomer() {
    axios.get('/api/customer', { params: { email: selector } }).then(res => setCustomers(res.data))
  }
  function getIntents() {
    axios.get('/api/intent', { params: { id: selector } })
      .then(res => setIntents(res.data))
      .catch(err => console.error(err.response.data.msg))
  }
  function getAddresses() {
    axios.get('/api/user', { params: { email: selector } }).then(res => setUsers(res))
  }
  function getAddress() {
    axios.get('/api/user', { params: { email: selector } }).then(res => setUsers(res))
  }
  function postAddress() {
    axios.post('/api/user', {email: selector, password: 'testing'}).then(res => setUsers(res))
  }
  function putAddress() {
    axios.put('/api/user', {email: selector }).then(res => setUsers(res))
  }
  function deleteAddress() {
    axios.delete('/api/user').then(res => setUsers(res))
  }
  
  return (
    <div>
      <Row>
        <Form.Control placeholder="Selector" className="my-3 ml-float w-50" onChange={e => setSelector(e.target.value)} value={selector} />
        <Form.Control placeholder="New Data" className="my-3 mr-float w-50" onChange={e => setNewData(e.target.value)} value={newData} />
      </Row>
      <Card>
        <Card.Body>
          <h1 className="display-4 mr-5 d-inline">User</h1>
          <Button className="mx-2" onClick={getUsers}>Get All</Button>
          <Button className="mx-2" onClick={getUser} disabled={!selector}>Get</Button>
          <Button variant="success" className="mx-2" onClick={postUser} disabled={!selector}>Post</Button>
          <Button variant="warning" className="mx-2" onClick={() => putUser()} disabled={!selector}>Put</Button>
          <Button variant="danger" className="mx-2" onClick={() => putUser(false)} disabled={!selector}>Delete</Button>
          {/* {users.length > 0 && users.map(user => (
            <div className="my-2 border p-2" key={user._id}>
              {Object.keys(user).map((item, index) => 
                <p style={{lineHeight: '0'}} key={index}><strong>{item}:</strong> {typeof user[item] == 'object' ? 'obj' : user[item]}</p>
              )}
            </div>
          ))} */}
          {users.length > 0 && users.map((user, index) => (
            <div key={index} className="border p-2">
              <p><strong>_id:</strong> {user._id}</p>
              <p><strong>email:</strong> {user.email}</p>
              <p><strong>active:</strong> {user.active ? 'true': 'false'}</p>
              <p><strong>createdAt:</strong> {format(user.createdAt)}</p>
              <p><strong>updatedAt:</strong> {format(user.updatedAt)}</p>
              {user.shipping &&
                <>
                  <h4><u>Shipping:</u></h4>
                  <div className="ml-3">
                    <p><strong>name:</strong> {user.shipping.name}</p>
                    <p><strong>line1:</strong> {user.shipping.address.line1}</p>
                    <p><strong>line2:</strong> {user.shipping.address.line2}</p>
                    <p><strong>postalCode:</strong> {user.shipping.address.postalCode}</p>
                    <p><strong>city:</strong> {user.shipping.address.city}</p>
                    <p><strong>country:</strong> {user.shipping.address.country}</p>
                    <p><strong>state:</strong> {user.shipping.address.state}</p>
                    <p><strong>phone:</strong> {user.shipping.phone}</p>
                  </div>
                </>
              }
            </div>
          ))}
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <h1 className="display-4 mr-5 d-inline">Order</h1>
          <Button className="mx-2" onClick={getAddresses}>Get All</Button>
          <Button className="mx-2" onClick={getAddress}>Get</Button>
          <Button variant="success" className="mx-2" onClick={postAddress}>Post</Button>
          <Button variant="warning" className="mx-2" onClick={putAddress}>Put</Button>
          <Button variant="danger" className="mx-2" onClick={deleteAddress}>Delete</Button>
          {orders.length > 0 && orders.map(address => (
            <>
              <p><strong>user:</strong> {address.user}</p>
              <p><strong>_id:</strong> {address._id}</p>
              <p><strong>name:</strong> {address.name}</p>
              <p><strong>line1:</strong> {address.line1}</p>
              <p><strong>line2:</strong> {address.line2}</p>
              <p><strong>postalCode:</strong> {address.postalCode}</p>
              <p><strong>city:</strong>{address.city}</p>
              <p><strong>country:</strong> {address.country}</p>
              <p><strong>state:</strong> {address.state}</p>
              <p><strong>phone:</strong> {address.phone}</p>
              <p><strong>status:</strong> {address.status}</p>
            </>
          ))}
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <h1 className="display-4 mr-5 d-inline">Customer</h1>
          <Button className="mx-2" onClick={getAddresses}>Get All</Button>
          <Button className="mx-2" onClick={getCustomer}>Get</Button>
          <Button variant="success" className="mx-2" onClick={postAddress}>Post</Button>
          <Button variant="warning" className="mx-2" onClick={putCustomer}>Put</Button>
          <Button variant="danger" className="mx-2" onClick={deleteAddress}>Delete</Button>
          {orders.length > 0 && orders.map(address => (
            <>
              <p><strong>user:</strong> {address.user}</p>
              <p><strong>_id:</strong> {address._id}</p>
              <p><strong>name:</strong> {address.name}</p>
              <p><strong>line1:</strong> {address.line1}</p>
              <p><strong>line2:</strong> {address.line2}</p>
              <p><strong>postalCode:</strong> {address.postalCode}</p>
              <p><strong>city:</strong>{address.city}</p>
              <p><strong>country:</strong> {address.country}</p>
              <p><strong>state:</strong> {address.state}</p>
              <p><strong>phone:</strong> {address.phone}</p>
              <p><strong>status:</strong> {address.status}</p>
            </>
          ))}
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <h1 className="display-4 mr-5 d-inline">Review</h1>
          <Button className="mx-2" onClick={getAddresses}>Get All</Button>
          <Button className="mx-2" onClick={getAddress}>Get</Button>
          <Button variant="success" className="mx-2" onClick={postAddress}>Post</Button>
          <Button variant="warning" className="mx-2" onClick={putAddress}>Put</Button>
          <Button variant="danger" className="mx-2" onClick={deleteAddress}>Delete</Button>
          
          {reviews.length > 0 && reviews.map(address => (
            <>
              <p><strong>user:</strong> {address.user}</p>
              <p><strong>_id:</strong> {address._id}</p>
              <p><strong>name:</strong> {address.name}</p>
              <p><strong>line1:</strong> {address.line1}</p>
              <p><strong>line2:</strong> {address.line2}</p>
              <p><strong>postalCode:</strong> {address.postalCode}</p>
              <p><strong>city:</strong>{address.city}</p>
              <p><strong>country:</strong> {address.country}</p>
              <p><strong>state:</strong> {address.state}</p>
              <p><strong>phone:</strong> {address.phone}</p>
              <p><strong>status:</strong> {address.status}</p>
            </>
          ))}
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <h1 className="display-4 mr-5 d-inline">Intents</h1>
          <Button className="mx-2" onClick={getIntents}>Get All</Button>
          <Button variant="success" disabled className="mx-2" onClick={postAddress}>Post</Button>
          <Button variant="warning" disabled className="mx-2" onClick={putAddress}>Put</Button>
          <Button variant="danger" disabled className="mx-2" onClick={deleteAddress}>Delete</Button>
          {intents.length > 0 && intents.map(intent => (
            <div className="my-3" key={intent.id}>
              {Object.keys(intent).map((item, index) => 
                <p style={{lineHeight: '0'}} key={index}><strong>{item}:</strong> {typeof intent[item] == 'object' ? 'obj' : intent[item]}</p>
              )}
            </div>
          ))}
        </Card.Body>
      </Card>
    </div>
  )
}

export async function getServerSideProps(context) {
  await connectDB()
  const user = await getUserFromContext(context).catch(console.log)
  if (user) {
    return {
      props: { user: jparse(user) }
    }
  }
  return { props: { } }
}