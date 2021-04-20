import React, { useEffect, useState } from 'react'
import { useSession } from 'coda-auth/client'
import axios from 'axios'
// import { connectDB, jparse } from '../util/db'
// import { getUser } from './api/user'

export default function Index() {
  const [session, loading] = useSession()
  const [email, setEmail] = useState('')

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
      <input id='emailInput' onChange={e => setEmail(e.target.value)} value={email} />
    </div>
  )
}

// export async function getServerSideProps() {
//   connectDB()
//   const user = await getUser('new@email.com')
//   return {
//     props: { user: jparse(user) }
//   }
// }