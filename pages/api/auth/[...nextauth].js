import NextAuth from 'coda-auth'
import Providers from 'coda-auth/providers'
import Adapters from 'coda-auth/adapters'
import { compare } from 'bcryptjs'
import axios from 'axios'
import { connectDB, jparse } from '../../../util/db'
import { User, Account, userSchema } from '../../../models'
import UserModelTypeORM, { UserSchemaTypeORM } from '../../../models/user'

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
              if (!user.password) {
                console.log('likely originally signed up with oauth but is trying credentials')
                return Promise.reject('/auth/login?error=invalid')
                // // find providers
                // const accounts = await Account.find({ userId: user._id })
                // // BUG: without JSON.strifiy & JSON.parse only the _id can be read
                // const providers = accounts.map(acc => jparse(acc).providerId) 
                // console.log('found providers', providers.toString())
                // if (providers.length > 0) throw 'oauth@' + providers.toString()
              }
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
            } else if (err.includes('oauth')) {
              return Promise.reject('/auth/login?error=oauth' + err.slice(5))
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
    adapter: Adapters.TypeORM.Adapter(
      // The first argument should be a database connection string or TypeORM config object
      process.env.MONGODB_URI,
      // The second argument can be used to pass custom models and schemas
      {
        models: {
          aUser: { model: UserModelTypeORM, schema: UserSchemaTypeORM },
          // User: { model: User, schema: userSchema },
        },
      }
    ),
    callbacks: {
      session: async (session, user) => {
        // console.log('---> session callback', session, user)

        if (user) session.id = user.id
        // console.log('session', session)
        return Promise.resolve(session)
      },
      jwt: async (token, user, acc, profile, isNewUser) => {
        // console.log('---> jwt', token)

        let email = token.email?.toLowerCase().trim()
        if (user) {
          if (acc.provider === 'github') {
            const data = await getGithubEmail(acc.accessToken)
            email = data.email
            // console.log('called github and got email', data.email)

            // TODO: can also add data.verified data to User
            await connectDB()
            await User.findByIdAndUpdate(user.id, { email: email.toLowerCase().trim() })
            // const newUser = await User.findByIdAndUpdate(user.id, { email: email.toLowerCase().trim() }, {new: true})
            // console.log('newUser', newUser)
          }
        }

        token.id = token.sub
        token.email = email

        // console.log('token', token)

        return Promise.resolve(token)
      },
      async signIn(user, acc, profile) {
        // console.log('raw', user, acc, profile)
        // console.log('---> signIn')

        // ensure a stripe customer is attached


        // console.log('signIn callback | signIn id', user.id, ' | provider', acc.provider)
        if (acc.provider === 'github') {
          // await connectDB()
          // const canCast = castToObjectId(user.id)
          // console.log('canCast', canCast)
          // const dbUser = await User.findById(user.id)
          // if (!dbUser.email) {
            // const data = await getGithubEmail(acc.accessToken)
            // console.log('found email', data.email, ' | verified', data.verified)
            // const newUser = await User.findByIdAndUpdate(user.id, { email: data.email }, { new: true })
            // console.log('--> newUser', newUser)
          // }
        }
        // const dbAccount = await Account.findOne({ userId: user.id })
        // console.log('--> dbAccount', dbAccount)
        return true
      },
    },
    pages: {
      signIn: '/auth/login',
      signOut: '/auth/logout',
      // newUser: '/auth/signup',
      error: '/auth/login' // Error code passed in query string as ?error=
    },
    session: {
      jwt: true, 
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    // debug: true,
    baseUrl: process.env.NEXT_PUBLIC_NEXTAUTH_URL,
    secret: process.env.NEXTAUTH_SECRET
  })
}

// async function getDBID(email) {
//   await connectDB()
//   if (!email) return
//   console.log('searching for dbid for email', email)
//   const thisUser = await User.findOne({ email }).catch(console.log)
//   if (!thisUser) return
//   console.log('get dbid =', thisUser._id)
//   return { db_id: thisUser._id, verified: thisUser.verified }
// }

async function getGithubEmail(token) {
  // console.log('fetching github data with token', token)
  const res = await axios.get('https://api.github.com/user/emails', {
    headers: {
      authorization: `Bearer ${token}`
    }
  }).catch(err => console.log('github get email error', err.response.data.message, 'token', token))
  if (!res) return
  // console.log('raw github data', data)
  // console.log('extracting email', data.filter(record => record.primary === true))
  return res.data.filter(record => record.primary === true)[0]
}