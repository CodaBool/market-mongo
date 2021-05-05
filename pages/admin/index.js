import ProductComponent from '../../components/Admin/Product'
import StripeComponent from '../../components/Admin/Stripe'

export default function newAdmin() {
  return (
    <>
      <ProductComponent />
      <StripeComponent />
    </>
  )
}
