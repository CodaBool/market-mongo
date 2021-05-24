import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Load } from '../components/Load'
import { Spinner } from 'react-bootstrap'
import { extractRelevantData, itemsValidation } from '../constants'

export default function Index({ time }) {
  useEffect(() => {
    // axios.get('/api/customer', {params: { email: 'codabool@pm.me' } })
    //   .then(res => console.log(res.data))
    //   .catch(err => console.error(err.response.data.msg))
    
    // const data = 
    // axios.get('/api/customer', {params: { email: 'who@mail.com' } })
    //   .then(res => console.log(res.data))
    //   .catch(err => console.error(err.response.data.msg))
    // axios.get('/api/test')
    //   .then(res => console.log(res.data))
    //   .catch(err => console.error(err.response.data.msg))

    
  }, [])


  function test() {
    const stuff = {
      "create_time": "2021-05-24T14:28:54Z",
      "purchase_units": [
          {
              "reference_id": "default",
              "amount": {
                  "currency_code": "USD",
                  "value": "1.00",
                  "breakdown": {
                      "item_total": {
                          "currency_code": "USD",
                          "value": "1.00"
                      }
                  }
              },
              "payee": {
                  "email_address": "sb-1d3np6113856@business.example.com",
                  "merchant_id": "HABJV8ZAFTWTS"
              },
              "items": [
                  {
                      "name": "thing",
                      "unit_amount": {
                          "currency_code": "USD",
                          "value": "1.00"
                      },
                      "quantity": "1",
                      "description": "some desc... ",
                      "sku": "prod_JQmgyaOTJlD1VG"
                  }
              ],
              "shipping": {
                  "name": {
                      "full_name": "John Doe"
                  },
                  "address": {
                      "address_line_1": "1 Main St",
                      "admin_area_2": "San Jose",
                      "admin_area_1": "CA",
                      "postal_code": "95131",
                      "country_code": "US"
                  }
              }
          }
      ],
      "id": "5TF317183G7212630",
      "intent": "CAPTURE",
      "payer": {
          "name": {
              "given_name": "John",
              "surname": "Doe"
          },
          "email_address": "sb-odshu6116493@personal.example.com",
          "payer_id": "YNJ3F8B4AXDNS",
          "address": {
              "country_code": "US"
          }
      },
      "status": "APPROVED"
    }
    const data = extractRelevantData(stuff)
    console.log(data)
    // const items = [
    //   {
    //     id_prod: 'prod_JQmgyaOTJlD1VG',
    //     name: 'thing',
    //     currency: 'USD',
    //     quantity: 1,
    //     value: 100
    //   },
    //   {
    //     id_prod: 'prod_JQmgyaOTJlD1VG',
    //     name: 'thing',
    //     currency: 'USD',
    //     quantity: 1,
    //     value: 100
    //   },
    // ]

    // axios.get('/api/test')
    //   .then(res => {
    //     // console.log(res.data)
    //     const data = extractRelevantData(res.data.intent)
    //     // const valid = itemsValidation(res.data.products, res.data.order.items, data)
    //     const valid = itemsValidation(res.data.products, items, data)
    //     console.log('result', valid)
    //   })
    //   .catch(console.error)
  }

  return (
    <div>
      <h1 onClick={test} className="display-1 my-5">Oops,</h1>
      <h3 className="display-4 m-2">This site is under active construction <div className="d-inline-block">🚧</div></h3>
      <a className="text-primary ml-4" href="https://github.com/CodaBool/market-mongo">Source Code</a>
      <br/>
      <span className="text-info ml-4">Envionment: </span><span> {process.env.NEXT_PUBLIC_STAGE}</span>
      <br/>
      <span className="text-success ml-4">Time: </span><span> {(new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds()) || 'undefined'}</span>
      <br/>
      <span className="text-danger ml-4">Build Time: </span><span> {time}</span>
      <br/>
      <span className="text-warning ml-4">Build: </span><span> {process.env.BUILD_ID}</span>
    </div>
  )
}

// revalidate test
export async function getStaticProps() {
  const date = new Date()
  const time = (date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()) || 'undefined'
  return { props: { time }, revalidate: 10 }
}