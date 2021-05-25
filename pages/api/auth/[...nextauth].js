import NextAuth from 'coda-auth'
import Providers from 'coda-auth/providers'
import { compare } from 'bcryptjs'
import { connectDB } from '../../../util/db'
import { User } from '../../../models'

export const config = {
  // nextjs doc for custom config https://nextjs.org/docs/api-routes/api-middlewares#custom-config
  api: {
    // was getting warning that API resolved without sending a response for /api/auth/session, this may result in stalled requests.
    // following stackoverflow answer I set this config but may be dangerous since I may not always return a response
    externalResolver: true
  }
}

export default (req, res) => {
  NextAuth(req, res, {
    providers: [
      Providers.Credentials({
        // The name to display on the sign in form (e.g. 'Sign in with...')
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
            const user = await User.findOne({ email: clientData.email }) // null if not found
              .catch(err => {
                console.log('signin error', err.message, '| timeout?', err.message.includes('timed out'))
                if (err.message.includes('timed out')) throw 'timeout'
              })
            if (user) {
              const validPassword = await compare(
                clientData.password,
                user.password
              )
              if (validPassword) { // complete successful login
                return { id: user._id, email: user.email.toLowerCase(), customerId: user.customerId }
              } else { // invalid password
                return Promise.reject(`/auth/login?error=invalid&email=${encodeURIComponent(clientData.email)}`)
              }
            } else {
              return Promise.reject('/auth/login?error=nonexistant')
            }
          } catch (err) {
            if (err === 'timeout') {
              return Promise.reject('/auth/login?error=timeout')
            } else {
              return Promise.reject('/auth/login?error=unknown')
            }
          }
        }
      }),
      Providers.GitHub({
        clientId: 'b1dc555d44f6b7d50386',
        clientSecret: process.env.GIT_CLIENT_SECRET
      }),
      // Providers.Twitter({
      //   clientId: 'b1dc555d44f6b7d50386', // under review
      //   clientSecret: process.env.TWITTER_CLIENT_SECRET
      // }),
      Providers.Google({
        clientId: '660235104603-0os64a862203ek3lre73o2sinbr2de58.apps.googleusercontent.com',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
      }),
      Providers.Facebook({
        clientId: '188652586473126',
        clientSecret: process.env.FB_CLIENT_SECRET
      })
    ],
    callbacks: {
      session: async (session, user) => {
        if (session) session.id = user.id
        if (session) session.customerId = user.customerId
        return Promise.resolve(session)
      },
      jwt: async (token, user, account, profile, isNewUser) => {
        if (user) token.id = user.id
        if (user) token.customerId = user.customerId
        return Promise.resolve(token)
      }
    },
    pages: {
      signIn: '/auth/login',
      signOut: '/auth/logout',
      newUser: '/auth/signup',
      error: '/' // Error code passed in query string as ?error=
    },
    baseUrl: process.env.NEXT_PUBLIC_NEXTAUTH_URL,
    secret: process.env.NEXTAUTH_SECRET
  })
}