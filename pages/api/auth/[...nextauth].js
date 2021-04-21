import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'
import { compare } from 'bcryptjs'
import { connectDB } from '../../../util/db'
import { getUser } from '../user'

export const config = {
  // nextjs doc for custom config https://nextjs.org/docs/api-routes/api-middlewares#custom-config
  api: {
    // was getting warning that API resolved without sending a response for /api/auth/session, this may result in stalled requests.
    // following stackoverflow answer I set this config but may be dangerous since I may not always return a response
    externalResolver: true
  }
}

export default (req, res) => {
  // console.log('/auth/[...nextauth] NEXTAUTH_URL=', process.env.NEXTAUTH_URL)
  NextAuth(req, res, {
    providers: [
      Providers.Credentials({
        // The name to display on the sign in form (e.g. 'Sign in w ith...')
        name: 'Credentials',
        // The credentials is used to generate a suitable form on the sign in page.
        // You can specify whatever fields you are expecting to be submitted.
        // e.g. domain, username, password, 2FA token, etc.
        credentials: {
          email: { label: 'Email', type: 'email', placeholder: 'Email' },
          password: {
            label: 'Password',
            type: 'password',
            placeholder: 'Password'
          }
        },

        authorize: async (clientData) => {
          try {
            await connectDB()
            const user = await getUser(clientData.email)
            if (user) {
              const validPassword = await compare(
                clientData.password,
                user.password
              )
              if (validPassword) { // complete successful login
                return { id: user._id, email: user.email }
              } else { // invalid password
                return Promise.reject('/auth/login?error=invalid')
              }
            } else {
              return Promise.reject('/auth/login?error=nonexistant')
            }
          } catch (err) {
            console.log('Login Failed', err)
            return Promise.reject('/auth/login?error=unknown')
          }
        }
      })
    ],
    pages: {
      signIn: '/auth/login',
      signOut: '/auth/logout',
      newUser: '/auth/signup',
      error: '/' // Error code passed in query string as ?error=
    },
    session: {
      jwt: true,
      maxAge: 30 * 24 * 60 * 60 // 30 days
    },
    jwt: {
      jwt: true,
      // signingKey: process.env.JWT_SIGNING_PK,
      // secret: process.env.JWT_SECRET, // defaults to NEXTAUTH_SECRET
    },
    debug: true,
    secret: process.env.NEXTAUTH_SECRET
  })
}


// callbacks: {
//   session: async (session, user) => {
//     console.log('in session callback', session, user)
//     if (session) session.id = user.id
//     return Promise.resolve(session)
//   },
//   jwt: async (token, user, account, profile, isNewUser) => {
//     console.log('in jwt callback')
//     if (user) token.id = user.id
//     console.log(token)
//     return Promise.resolve(token)
//   }
// },