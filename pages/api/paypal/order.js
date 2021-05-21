import { getSession } from 'coda-auth/client'
import sdk from '@paypal/checkout-server-sdk'
import applyMiddleware from '../../../util'
// import { castToObjectId } from '../../../util/db'
import { User, Order, Product } from '../../../models'
import { convertPayPalAmount, MAX_DUP_ITEMS, usd, createOrderValidation } from '../../../constants'

export default applyMiddleware(async (req, res) => {
  try {
    const session = await getSession({ req })
    if (!session) throw 'Unauthorized'
    const { method, body, query, headers } = req

    const env = new sdk.core.SandboxEnvironment(process.env.NEXT_PUBLIC_PAYPAL_ID, process.env.PAYPAL_SK)
    const paypal = new sdk.core.PayPalHttpClient(env)

    if (method === 'POST') {
      if (body.orderID) { // capture order

        const request = new sdk.orders.OrdersCaptureRequest(body.orderID)
        request.requestBody({})
        const { result } = await paypal.execute(request)
        const charges = result.purchase_units[0].payments.captures.map(charge => ({
          _id: charge.id,
          pay_status: charge.status,
          amount: convertPayPalAmount(charge.amount.value),
          fee: convertPayPalAmount(charge.seller_receivable_breakdown.paypal_fee.value),
          currency: charge.amount.currency_code,
          created: charge.create_time
        }))
        const orderData = {
          charges,
          status: 'capture',
          pay_status: result.status,
          id_customer: result.payer.payer_id,
          amount_received: convertPayPalAmount(result.purchase_units[0].payments.captures[0].amount.value),
          shipping: {
            name: result.purchase_units[0].shipping.name.full_name,
            address: {
              city: result.purchase_units[0].shipping.address.admin_area_2,
              country: result.purchase_units[0].shipping.address.country_code,
              line1: result.purchase_units[0].shipping.address.address_line_1,
              line2: result.purchase_units[0].shipping.address.address_line_2,
              postal_code: result.purchase_units[0].shipping.address.postal_code,
              state: result.purchase_units[0].shipping.address.admin_area_1,
            }
          }
        }
        console.log('PAYPAL CAPTURE:\n_id='+result.id, '|', result.status , '@', convertPayPalAmount(result.purchase_units[0].payments.captures[0].amount.value))
        await Order.findOneAndUpdate({ _id: result.id }, orderData)

        // DEBUG
        // console.log('paypal data', JSON.stringify(result, null, 4))

        res.status(200).json({order_id: result.id})
        
      } else { // create order

        const products = await Product.find()
        const { vendorLines, total, orderLines } = createOrderValidation(products, body, 'paypal')

        const request = new sdk.orders.OrdersCreateRequest()
        request.prefer("return=representation")
        request.requestBody({
          intent: 'CAPTURE',
          application_context: {
            shipping_preference: 'GET_FROM_FILE'
          },
          purchase_units: [{
            items: vendorLines,
            amount: {
              currency_code: 'USD',
              value: usd(total),
              breakdown: { // https://developer.paypal.com/docs/api/orders/v2/#definition-amount_breakdown
                item_total: {
                  currency_code: 'USD',
                  value: usd(total)
                }, // handling, shipping, discount
              }
            }
          }]
        })
        const order = await paypal.execute(request).catch(err => {
          console.log(JSON.parse(err._originalError.text))
        })

        console.log('PAYPAL CREATE:\n_id=' + order.result.id, '|', vendorLines.length,'items @', usd(total), )

        const orderData = {
          _id: order.result.id,
          email: session.user.email,
          vendor: 'paypal',
          user: session.id,
          status: 'created',
          pay_status: order.result.status,
          currency: order.result.purchase_units[0].amount.currency_code,
          amount: total,
          shipping: order.result.purchase_units[0].shipping,
          valid: { wh_verified: false },
          items: orderLines
        }
        
        // DEBUG
        // console.log('paypal order', JSON.stringify(order, null, 4))
        
        // TODO: try to remove await
        await Order.create(orderData)

        res.status(200).json(order)
        
      }
    } else if (method === 'GET') {
      // res.status(200).json({msg: 'hi'})
      throw 'bad route'
    } else if (method === 'PUT') {
      throw 'bad route'
    } else {
      throw `Cannot use ${method} method for this route`
    }
  } catch (err) {
    console.log(err)
    if (typeof err === 'string') {
      res.status(400).json({ msg: 'order: ' + err })
    } else {
      res.status(500).json({ msg: 'order: ' + (err.message || err)})
    }
  }
})

async function storeOrder(body, paypal, headers) {
  console.log(JSON.stringify(body, null, 4))
  if (!body.details || !body.data) throw 'Missing data'

  // basic verification
  console.log('checking', process.env.PAYPAL_MERCHANT_ID, body.details.purchase_units[0].payee.merchant_id)
  console.log('checking', process.env.PAYPAL_SANDBOX_SELLER_ACCOUNT, body.details.purchase_units[0].payee.email_address)
  if (process.env.PAYPAL_MERCHANT_ID !== body.details.purchase_units[0].payee.merchant_id) throw 'Unauthorized'
  if (process.env.PAYPAL_SANDBOX_SELLER_ACCOUNT !== body.details.purchase_units[0].payee.email_address) throw 'Unauthorized'

  // full verification
  // const paypalOrder = await axios.get(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${body.details.id}`, {
  //   auth: {
  //     username: process.env.NEXT_PUBLIC_PAYPAL_ID,
  //     password: process.env.PAYPAL_SK
  //   },
  // }).then(res => res.data)
  //   .catch(err => err.response.data)
  //   .catch(console.log)

  // const res = await paypal.execute({
  //   verb: "GET",
  //   path: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${body.details.id}`,
  //   headers: { "Content-Type": "application/json" }
  // }).catch(console.log)

  console.log(res)
  
  // default error obj which should be overridden
  let valid = { error: `No such PayPal order "${body.details.id}"`, wh_verified: false }
  if (paypalOrder) {
    // console.log('paypal order to verify against', JSON.stringify(paypalOrder, null, 4))
    valid = {
      wh_verified: false,
      id: paypalOrder.id === body.details.id ? true : `${paypalOrder.id}!=${body.details.id}`,
      status: paypalOrder.status === 'COMPLETE' ? true : `${paypalOrder.status}!=COMPLETE`,
      local_amount: 
        paypalOrder.purchase_units[0].amount.value === usd(body.price)
          ? true
          : `${paypalOrder.purchase_units[0].amount.value}!=${usd(body.price)}`,
      req_amount: 
        paypalOrder.purchase_units[0].amount.value === body.details.purchase_units[0].payments.captures[0].amount.value 
          ? true 
          : `${paypalOrder.purchase_units[0].amount.value}!=${body.details.purchase_units[0].payments.captures[0].amount.value}`,
      currency: 
        paypalOrder.purchase_units[0].payments.captures[0].amount.currency_code === body.details.purchase_units[0].payments.captures[0].amount.currency_code 
          ? true 
          : `${paypalOrder.purchase_units[0].payments.captures[0].amount.currency_code}!=${body.details.purchase_units[0].payments.captures[0].amount.currency_code}`,
      status: 
        paypalOrder.purchase_units[0].payments.captures[0].status === body.details.purchase_units[0].payments.captures[0].status
          ? true 
          : `${paypalOrder.purchase_units[0].payments.captures[0].status}!=${body.details.purchase_units[0].payments.captures[0].status}`,
      payerID: 
        paypalOrder.payer.payer_id === body.data.payerID
          ? true 
          : `${paypalOrder.payer.payer_id}!=${body.data.payerID}`,
    }

    console.log('order validation', {
      id: `${paypalOrder.id} = ${body.details.id} | ${valid.id}`,
      status: `${paypalOrder.status} = COMPLETE  | ${valid.status}`,
      local_amount: `${paypalOrder.purchase_units[0].amount.value} = ${usd(body.price)}  | ${valid.local_amount}`,
      req_amount: `${paypalOrder.purchase_units[0].amount.value} = ${body.details.purchase_units[0].payments.captures[0].amount.value}  | ${valid.req_amount}`,
      currency: `${paypalOrder.purchase_units[0].payments.captures[0].amount.currency_code} = ${body.details.purchase_units[0].payments.captures[0].amount.currency_code}  | ${valid.currency}`,
      status: `${paypalOrder.purchase_units[0].payments.captures[0].status} = ${body.details.purchase_units[0].payments.captures[0].status}  | ${valid.status}`,
      payerID: `${paypalOrder.payer.payer_id} = ${body.data.payerID}  | ${valid.payerID}`,
    })
  }
  return await Order.create(orderData)
}



// export function getOrderShipping(id) {
//   return axios.get(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${id}`, {
//     auth: {
//       username: process.env.NEXT_PUBLIC_PAYPAL_ID,
//       password: process.env.PAYPAL_SK
//     },
//   }).then(res => {
//     if (res.data.purchase_units[0].shipping) {
//       console.log('FOUND SHIPPING')
//     } else {
//       console.log('no shipping tied to order')
//     }
//     return res.data.purchase_units[0].shipping
//   })
// }