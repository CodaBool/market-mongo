import { PayPalButton } from "react-paypal-button-v2"
import axios from "axios"
import { useRouter } from "next/router"
import { useShoppingCart } from "use-shopping-cart"

export default function PayPal({ setPayError, setShowError }) {
  const { cartDetails, totalPrice } = useShoppingCart()
  const router = useRouter()
  const amount = String(totalPrice).slice(0, -2) + '.' + String(totalPrice).slice(-2)

  return (
    <div className="w-100" style={{position: 'relative'}}>
      <div className="paypal-skeleton rounded w-100"></div>
      <div className="paypal-container">
        <PayPalButton
          amount={amount}
          currency="USD"
          shippingPreference="GET_FROM_FILE" // default is "NO_SHIPPING"
          createOrder={() => (          
            axios.post('/api/paypal/order', cartDetails)
              .then(res => res.data.result.id)
              .catch(err => console.log(err.response.data.msg))
          )}
          onApprove={data => {
            axios.post('/api/paypal/order', data)
              .then(res => {
                if (res.data.order_id) {
                  router.push(`/checkout/confirmed?id=${res.data.order_id}`)
                }
              })
              .catch(err => {
                console.log(err)
                setPayError(`${err.response.data.msg} ${err.response.status}`)
                setShowError(true)
              })
              .catch(console.log)
          }}
          style={{
            color: 'silver',
            shape: 'rect',
            tagline: false,
            layout:  'horizontal',
            height: 55
          }}
          catchError={err => console.log('catchError', err)}
          onError={err => {
            if (err.message === 'Expected an order id to be passed') {
              console.log('cannot create order')
            } else {
              console.log('new error', err.message)
              console.log('CREATE AN IF FOR THIS')
            }
          }}
          onCancel={err => console.log('onCancel', err)}
          options={{
            clientId: process.env.NEXT_PUBLIC_PAYPAL_ID,
            disableFunding: 'paylater,bancontact,blik,eps,giropay,ideal,mercadopago,mybank,p24,sepa,sofort',
            vault: false,
            commit: true,
          }}
        />
      </div>
    </div>
  )
}