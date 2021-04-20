import nextConnect from 'next-connect'
import dbMiddleware from './db'
import { parseCookies } from 'nookies'

export function jwtFromReqOrCtx(reqOrContext) {
  if (!reqOrContext) return null
  let cookies = null
  if (reqOrContext.req) { // Nextjs context
    cookies = parseCookies(reqOrContext)
  } else { // typical req object
    cookies = parseCookies({req: reqOrContext})
  }
  if (cookies) {
    const token = cookies['__Secure-next-auth.session-token'] || cookies['next-auth.session-token']
    if (token) {
      return parseJwt(token)
    } else { // no session
      return null
    }
  }
}

export function parseJwt(token) {
  var base64Payload = token.split('.')[1];
  var payload = Buffer.from(base64Payload, 'base64');
  return JSON.parse(payload.toString());
}

export default function createHandler(...middlewares) {
  return nextConnect().use(dbMiddleware, ...middlewares)
}

// Uses atob to parse
// export function atobParseJwt(token) {
//   var base64Url = token.split('.')[1]
//   var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
//   var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
//       return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
//   }).join(''))
//   return JSON.parse(jsonPayload)
// }