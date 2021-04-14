import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/client'
import axios from 'axios'
import { getUser } from './api/user'
import { useShoppingCart } from 'use-shopping-cart'

export default function Index({ user }) {
  const { cartDetails } = useShoppingCart()
  const [email, setEmail] = useState('')
  const [session, loading] = useSession()

  console.log('MONGODB_URI =', process.env.MONGODB_URI)

  console.log(cartDetails)

  function handleUser() {
    axios.get('/api/user', { params: { email } })
      .then(res => {
        console.log('get =', res.data)
        if (res.data === 'User not found') {
          console.log('Could not find the user')
        }
      })
      .catch(err => console.log(err.response.data)) // .response.data
  }
  function postUser() {
    axios.post('/api/user', { email, password: 'beans' })
      .then(res => console.log('posted =', res.data))
      .catch(err => console.log(err.response.data)) // .response.data
  }

  return (
    <div>
      <button onClick={handleUser} >get user</button>
      <button onClick={postUser} >post user</button>
      <input onChange={e => setEmail(e.target.value)} value={email} />
      {user?.length ? user.map(user => (
        <h1 key={user.email}>{user.email}</h1>
      ))
      : <h1>Could not get users</h1>
      }
    </div>
  )
}

export async function getServerSideProps() {
  let user = []
  await getUser()
    .then(resp => user = JSON.parse(JSON.stringify(resp)))
    .catch(err => console.log('err', err))
  return {
    props: { user }
  }
}