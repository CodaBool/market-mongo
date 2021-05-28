import NextAuth from 'coda-auth'
import Providers from 'coda-auth/providers'
import { compare } from 'bcryptjs'
import axios from 'axios'
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
            console.log('authorize check on', clientData.email)
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
                // TODO: change this to db_id
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
        clientId: process.env.NODE_ENV === 'production' ? 'b1dc555d44f6b7d50386' : '667a50a643e6e59c65e3',
        clientSecret:  process.env.NODE_ENV === 'production' ? process.env.GIT_CLIENT_SECRET : process.env.GITH_LOCAL_SECRET
      }),
      Providers.Twitter({
        clientId: '8xYV207SzsGDbh3GGscA8ogGG',
        clientSecret: process.env.TWITTER_CLIENT_SECRET
      }),
      Providers.Google({
        clientId: '660235104603-0os64a862203ek3lre73o2sinbr2de58.apps.googleusercontent.com',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
      }),
      Providers.Discord({
        clientId: '846746476742311956',
        clientSecret: process.env.DISCORD_CLIENT_SECRET
      }),
      Providers.Facebook({
        clientId: '188652586473126',
        clientSecret: process.env.FB_CLIENT_SECRET
      })
      // https://dev.codattest.com/api/auth/callback/PROVIDER_NAME
    ],
    callbacks: {
      session: async (session, user) => {
        // console.log('AUTH --> session', session, user)
        if (session) session.db_id = user.db_id
        if (session) session.customerId = user.customerId
        console.log('session, db_id', session.db_id, ' | sub', user.sub)
        return Promise.resolve(session)
      },
      jwt: async (token, user, account, profile, isNewUser) => {
        // console.log('AUTH --> jwt', token, user)
        if (token.email === null && account) {
          const data = await getGithubEmail(account.accessToken)
          token.email = data.email
          // console.log('found email', data.email, ' | verified', data.verified)
        }
        if (!token.db_id) {
          // console.log('Adding Database Data')
          const result = await getDBID(token.email)
          if (result?.hasMore) {

          }
          // console.log('data', data)
          if (result?.db_id) {
            token.db_id = result.db_id
            // console.log('sub', )
            // console.log('final token --->', token)
          }
        }
        if (user) token.id = user.id
        if (user) token.customerId = user.customerId
        // console.log('AUTH --> jwt', token)
        console.log('jwt, db_id', token.db_id, ' | sub', token.sub)
        if (!token.db_id) return Promise.reject('wowee')
        return Promise.resolve(token)
      }
    },
    pages: {
      signIn: '/auth/login',
      signOut: '/auth/logout',
      newUser: '/auth/signup',
      error: '/auth/login' // Error code passed in query string as ?error=
    },
    baseUrl: process.env.NEXT_PUBLIC_NEXTAUTH_URL,
    secret: process.env.NEXTAUTH_SECRET
  })
}

async function getDBID(email) {
  await connectDB()
  if (!email) return
  const user = await User.findOne({ email }).catch(console.log)
  if (!user) return
  console.log('get dbid =', user._id)
  return { db_id: user._id, verified: user.verified }
}

async function getGithubEmail(token) {
  // console.log('fetching github data with token', token)
  const res = await axios.get('https://api.github.com/user/emails', {
    headers: {
      authorization: `Bearer ${token}`
    }
  })
  if (!res) return
  // console.log('raw github data', data)
  // console.log('extracting email', data.filter(record => record.primary === true))
  return res.data.filter(record => record.primary === true)[0]
}

/*
function find

github no email


Google
account.accessToken (?)
account.idToken (jwt)
account.token_type (Bearer)

profile.email
profile.verified_email: true

Twitter
account.accessToken

profile.email

  simple verify
profile.suspended
profile.verified
profile.statuses_count
profile.followers_count
profile.created_at

Discord

account.accessToken
account.token_type

profile.email
profile.verified
profile.locale

Github
account.accessToken
account.token_type

profile.url
*/