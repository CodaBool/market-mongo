import React, { useEffect, useState } from 'react'
import { useSession } from 'coda-auth/client'
import axios from 'axios'
import { connectDB, jparse } from '../util/db'
import { getUser } from './api/user'

export default function Index({ user }) {
  const [session, loading] = useSession()
  const [email, setEmail] = useState('')

  console.log('session', session)

  useEffect(() => {
    let envVars = {}
    if (process.env.NEXT_PUBLIC_STRIPE_PK) {
      envVars.NEXT_PUBLIC_STRIPE_PK = 'found'
    } else {
      envVars.NEXT_PUBLIC_STRIPE_PK = 'MISSING'
    }
    if (process.env.NEXT_PUBLIC_STAGE) {
      envVars.NEXT_PUBLIC_STAGE = process.env.NEXT_PUBLIC_STAGE
    } else {
      envVars.NEXT_PUBLIC_STAGE = 'MISSING'
    }
    if (process.env.NEXTAUTH_SECRET) {
      envVars.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET
    } else {
      envVars.NEXTAUTH_SECRET = 'MISSING'
    }
    if (process.env.NEXTAUTH_URL) {
      envVars.NEXTAUTH_URL = process.env.NEXTAUTH_URL
    } else {
      envVars.NEXTAUTH_URL = 'MISSING'
    }
    if (process.env.MONGODB_URI) {
      envVars.MONGODB_URI = 'found'
    } else {
      envVars.MONGODB_URI = 'MISSING'
    }
    if (process.env.STRIPE_SK) {
      envVars.STRIPE_SK = 'found'
    } else {
      envVars.STRIPE_SK = 'MISSING'
    }
    // console.log(envVars)
    // console.log('client side /pages/index NEXTAUTH_URL = ', process.env.NEXTAUTH_URL)
  }, [])

  function getCSRF() {
    axios.get('/api/getCSRF')
      .then(res => console.log(res.data))
      .catch(err => console.error(err.response.data.msg))
  }
  function getSession() {
    axios.get('/api/getSession')
      .then(res => console.log(res.data))
      .catch(err => console.error(err.response.data.msg))
  }
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
      <button onClick={test}>test</button> 
      <button onClick={getCSRF}>getCSRF</button> 
      <button onClick={getSession}>getSession</button> 
      <button onClick={testwoMiddleWare}>Test without middleware but await instead</button> 
      <button onClick={testEnv}>test Env</button> 
      <input onChange={e => setEmail(e.target.value)} value={email} />
      <h1>{user?.email}</h1>
    </div>
  )
}

export async function getServerSideProps() {
  connectDB()
  const user = await getUser('new@email.com')
  return {
    props: { user: jparse(user) }
  }
}