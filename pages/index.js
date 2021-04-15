import React, { useEffect, useState } from 'react'
// import { useSession } from 'next-auth/client'
import axios from 'axios'
// import { connectDB, jparse } from '../util/db'
// import { getUser } from './api/user'

// import { useShoppingCart } from 'use-shopping-cart'

export default function Index() {
  // const { cartDetails } = useShoppingCart()
  const [email, setEmail] = useState('')

  console.log('FRONT THIGH GAP TEST', {
    NEXT_PUBLIC_STRIPE_PK: process.env.NEXT_PUBLIC_STRIPE_PK, 
    NEXT_PUBLIC_STAGE: process.env.NEXT_PUBLIC_STAGE, 
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET, 
    NEXTAUTH_URL: process.env.NEXTAUTH_URL, 
    MONGODB_URI: process.env.MONGODB_URI, 
    STRIPE_SK: process.env.STRIPE_SK
  })
  // const [session, loading] = useSession()

  // console.log(cartDetails)
  console.log('NEXTAUTH_URL', process.env.NEXTAUTH_URL)

  function handleUser() {
    axios.get('/api/user', { params: { email }})
      .then(res => {
        console.log('get =', res.data)
        // if (res.data === 'User not found') {
        //   console.log('Could not find the user')
        // }
      })
      .catch(err => console.error(err.response.data.msg)) // .response.data
  }
  // function postUser() {
  //   axios.post('/api/user', { email, password: 'beans' })
  //     .then(res => console.log('posted =', res.data))
  //     .catch(err => console.log(err.response.data)) // .response.data
  // }

  function test() {
    axios.get('/api/test')
      .then(res => console.log(res.data))
      .catch(err => console.error(err.response.data.msg))
  }
  function testwoMiddleWare() {
    axios.get('/api/testwoMiddleWare')
      .then(res => console.log(res.data))
      .catch(err => console.error(err.response.data.msg))
  }
  function testEnv() {
    axios.get('/api/testENV')
      .then(res => console.log(res.data))
      .catch(err => console.error(err.response.data.msg))
  }

  return (
    <div>
      <button onClick={handleUser} >get user</button>
      {/* <button onClick={postUser} >post user</button> */}
      <button onClick={test}>test</button> 
      <button onClick={testwoMiddleWare}>Test without middleware but await instead</button> 
      <button onClick={testEnv}>test Env</button> 
      <input onChange={e => setEmail(e.target.value)} value={email} />
      {/* {user?.length ? user.map(user => (
        <h1 key={user.email}>{user.email}</h1>
      ))
      : <h1>Could not get users</h1>
      } */}
    </div>
  )
}

// export async function getServerSideProps() {
//   connectDB()
//   const user = await getUser('coda@bool.com')
//   return {
//     props: { user: jparse(user) }
//   }
// }