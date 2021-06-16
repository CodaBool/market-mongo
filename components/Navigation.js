import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession } from 'coda-auth/client'

export default function Navigation() {
  const [session, loading] = useSession()
  const router = useRouter()
  console.log('email', session?.user?.email)

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand onClick={() => router.push('/')}>Home</Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="ml-auto">
          <Link href="/browse/1">
            <div className={`${router.asPath.includes('/browse') && 'active'} nav-link`}>
              Browse
            </div>
          </Link>
          {session ? (
            <>
              {session.user?.email === 'codabool@pm.me' && // TODO: revaluate since oauth
                <>
                  <Link href="/admin">
                    <div className={`${router.asPath === '/admin' && 'active'} nav-link`}>
                      Admin
                    </div>
                  </Link>
                </>
              }
              <Link href="/account">
                <div className={`${router.asPath.includes('/account') && 'active'} nav-link`}>
                  Account
                </div>
              </Link>
              <Link href="/checkout/cart">
                <div className={`${router.asPath === '/checkout/cart' && 'active'} nav-link`}>
                  Cart
                </div>
              </Link>
              <Link href="/auth/logout">
                <div
                  className={`${
                    router.asPath === '/auth/logout' && 'active'
                  } nav-link`}
                >
                  Logout
                </div>
              </Link>
            </>
          ) : (
            <Link href="/auth/login">
              <div
                className={`${
                  router.asPath === '/auth/login' && 'active'
                } nav-link`}
              >
                Login
              </div>
            </Link>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}
