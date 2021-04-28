import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Index() {
  
  useEffect(() => {
    // axios.get('/api/customer', {params: { email: 'codDa@bool.com' } })
    //   .then(res => console.log(res.data))
    //   .catch(err => console.error(err.response.data.msg))
    

    // const data = 
    axios.get('/api/customer', {params: { email: 'who@mail.com' } })
      .then(res => console.log(res.data))
      .catch(err => console.error(err.response.data.msg))
    // axios.get('/api/test')
    //   .then(res => console.log(res.data))
    //   .catch(err => console.error(err.response.data.msg))
  }, [])

  function test() {
    axios.post('/api/customer', {email: 'coDddda@bool.com', password: 'uwuOwOuwuOwOuwu' })
      .then(res => console.log(res.data))
      .catch(err => console.error(err.response.data.msg))
  }

  return (
    <div>
      <h1 onClick={test} className="display-1 my-5">Oops,</h1>
      <h3 className="display-4 m-2">This site is under active construction <div className="d-inline-block">🚧</div></h3>
      <a className="text-primary ml-4" href="https://github.com/CodaBool/market-mongo">Source Code</a>
      <br/>
      <span className="text-info ml-4">Envionment: </span><span> {process.env.NEXT_PUBLIC_STAGE}</span>
      <br/>
      <span className="text-success ml-4">Time: </span><span> {new Date().getHours() + ':' + new Date().getMinutes()}</span>
      <br/>
      <span className="text-warning ml-4">Build: </span><span> {process.env.BUILD_ID}</span>
    </div>
  )
}