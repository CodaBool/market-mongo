import nextConnect from 'next-connect'
import dbMiddleware from './db'
import { parseCookies } from 'nookies'
import atob from 'atob'

export function idFromReqOrCtx(req, context) {
  let cookies
  if (req) {
    cookies = parseCookies(req)
  } else {
    cookies = parseCookies(context)
  }
  if (cookies) {
    const token = cookies['__Secure-coda-auth.session-token'] || cookies['next-auth.session-token']
    if (token) {
      return parseJwt(token).id
    } else {
      console.log('no session')
      return null
    }
  }
}

export function parseJwt(token) {
  var base64Url = token.split('.')[1]
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join(''))
  return JSON.parse(jsonPayload)
}



export default function createHandler(...middlewares) {
  return nextConnect().use(dbMiddleware, ...middlewares)
}