import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/client'

export default function Navigation() {
  const [session, loading] = useSession()
  const router = useRouter()

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand onClick={() => router.push('/')}>Home</Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="ml-auto">
          <Link href="/test">
            <div className={`${router.asPath === '/test' && 'active'} nav-link`}>
              test
            </div>
          </Link>
          <Link href="/browse/1">
            <div className={`${router.asPath === '/browse' && 'active'} nav-link`}>
              browse
            </div>
          </Link>
          <Link href="/other">
            <div
              className={`${router.asPath === '/other' && 'active'} nav-link`}
            >
              other
            </div>
          </Link>
          {session ? (
            <>
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
