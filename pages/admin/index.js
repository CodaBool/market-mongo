import { useState } from 'react'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Stripe from '../../components/Admin/Stripe'
import Images from '../../components/Admin/Images'
import Product from '../../components/Admin/Product'
import { useSession, signIn } from 'coda-auth/client'

export default function newAdmin() {
  const [session, loading] = useSession()
  const [key, setKey] = useState('product')

  if (!session && !loading) signIn()
  
  return (
    <Tabs
      id="tab"
      activeKey={key}
      onSelect={key => setKey(key)}
      className="mt-2"
    >
      <Tab eventKey="stripe" title="Stripe">
        <Stripe />
      </Tab>
      <Tab eventKey="product" title="Product">
        <Product />
      </Tab>
      <Tab eventKey="image" title="Image">
        <Images />
      </Tab>
    </Tabs>
  )
}
