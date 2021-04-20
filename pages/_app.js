import Head from 'next/head'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import Container from 'react-bootstrap/Container'

import { CartProvider } from 'use-shopping-cart'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/globals.css'
import { Provider } from 'coda-auth/client'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK)

export default function app({ Component, pageProps }) {
  return (
    <div className="site">
      <Provider session={pageProps.session}>
        <CartProvider
          stripe={stripePromise}
          mode="checkout-session"
          currency="usd"
          // allowedCountries={['US']}
          // billingAddressCollection={true}
        >
          <Elements stripe={stripePromise}>
            <Head>
              <title>E-Commerce App</title>
              <meta charSet="UTF-8" />
              <meta name="description" content="An e-commerce site which integrates with Stripe built on Nextjs" />
              <meta name="viewport" content="initial-scale=1.0, width=device-width" />
              <link rel="apple-touch-icon" href="/image/favicon-32x32.gif"></link>
              <link rel="icon" href="/image/favicon-32x32.gif" />
            </Head>
            <Navigation />
            <main>
              <Container>
                <Component {...pageProps} />
              </Container>
            </main>
            <Footer />
          </Elements>
        </CartProvider>
      </Provider>
    </div>
  )
}
