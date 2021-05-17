import Head from 'next/head'
import Container from 'react-bootstrap/Container'
import { Provider } from 'coda-auth/client'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { CartProvider } from 'use-shopping-cart'
import Router from 'next/router'
import NProgress from 'nprogress'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/globals.css'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false, trickleRate: 0.1, trickleSpeed: 300 })
Router.events.on('routeChangeStart', () => NProgress.start())
Router.events.on('routeChangeError', () => NProgress.done())
Router.events.on('routeChangeComplete', () => NProgress.done())

export default function app({ Component, pageProps }) {
  // TODO: use-shopping-cart has moved to instead wanting the stripe public key string directly instead of the promise
  // however, I get verbose console messages with this. Sticking to beta.5 and passing a promise until this is cleaned up
  return (
    <div className="site">
      <Provider session={pageProps.session}>
        <CartProvider
          stripe={process.env.NEXT_PUBLIC_STRIPE_PK}
          mode="checkout-session"
          currency="USD"
          // allowedCountries={['US']}
          // billingAddressCollection={true}
        >
          <Head>
            <title>E-Commerce App</title>
            <meta charSet="UTF-8" />
            <meta name="description" content="An e-commerce site which integrates with Stripe built on Nextjs" />
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            <link rel="apple-touch-icon" href="/image/favicon-32x32.gif" />
            <link rel="icon" href="/image/favicon-32x32.gif" />
          </Head>
          <Navigation />
          <main>
            <Container>
              <Component {...pageProps} />
            </Container>
          </main>
          <Footer />
        </CartProvider>
      </Provider>
    </div>
  )
}
