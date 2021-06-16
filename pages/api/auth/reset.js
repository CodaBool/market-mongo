import applyMiddleware from '../../../util'
import { getSession } from 'coda-auth/client'
import { Token, User } from '../../../models'
import  { SESClient, SendEmailCommand }  from  "@aws-sdk/client-ses"
// import sgMail from '@sendgrid/mail'
import { randString } from '../../../constants'

export default applyMiddleware(async (req, res) => {
  try {
    const { method, body, query, params } = req
    if (method === 'POST') {
      if (!body.email) throw 'No Email Provided'
      const user = await User.findOne({ email: body.email })
      console.log('user found by email', user.email)
      if (!user) throw 'No User found'

      const newToken = await Token.create({ user: user._id, token: randString(), intent: 'reset' })
      console.log('newToken', newToken.token)
      const to = process.env.MY_EMAIL

      // Send an email to the body.email address
      const sesClient = new SESClient({ 
        apiKey: process.env.AWS_ACCESS_KEY_ID,
        apiSecret: process.env.AWS_SECRET_ACCESS_KEY,
        region: 'us-east-1'
      })

      const params = {
        Destination: {
          ToAddresses: [to]
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: `
                <strong>Reset Your Password</strong>
                <p>We have gotten a request that you would like to reset your password</p>
                <p>If you did make this request, then use the link provided to finish the password reset for your account</p>
                <a href="${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/auth/reset?id=${newToken.token}">${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/auth/reset?id=${newToken.token}</a>
                <p>If you didn’t want to reset your password, you can safely ignore this email and carry on as usual</p>
              `,
            },
            Text: {
              Charset: 'UTF-8',
              Data: 'TEXT_FORMAT_BODY1',
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: 'Password Reset Requested',
          },
        },
        Source: 'codabool@pm.me', // SENDER_ADDRESS
      }
      const data = await sesClient.send(new SendEmailCommand(params))
      // console.log('raw data', data)
      console.log('status', data['$metadata'].httpStatusCode)

      res.status(200).json({ status: data['$metadata'].httpStatusCode })
    } else if (method === 'GET') {
      throw 'bad route'
    } else if (method === 'PUT') {
      // const user = await User.findById(session.id)
      // const token = randString(20)
      // const user = await User.findOne({ email: body.email })
      // // console.log('user', user)
      // if (!user) throw 'No User found'
      console.log('body', body)
      const token = await Token.findOne({ token: body.token })
      console.log('token', token)
      // none found if null
      if (!token) throw 'Token may have expired, please go to login and resend a request for a reset'

      const newUser = await User.findByIdAndUpdate(token.user, { password: body.password }, {new: true})
      console.log('newUser', newUser)

      // Send an email to the body.email address
      const sesClient = new SESClient({
        apiKey: process.env.AWS_ACCESS_KEY_ID,
        apiSecret: process.env.AWS_SECRET_ACCESS_KEY,
        region: 'us-east-1'
      })

      const params = {
        Destination: {
          ToAddresses: [process.env.MY_EMAIL]
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: `
                <strong>Your password has been reset</strong>
                <p>You have successfully reset your password on your account.</p>
                <p>If you made this reset, then you can safely delete this email</p>
                <p>If you did not do this reset, this could mean someone has gotten into your account.</p>
                <p>Please immediately reset your password to prevent unauthorized activity.</p>
                <a href="${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/auth/request">${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/auth/request</p>
              `,
            },
            Text: {
              Charset: 'UTF-8',
              Data: 'TEXT_FORMAT_BODY1',
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: 'Password Reset Complete',
          },
        },
        Source: 'codabool@pm.me', // SENDER_ADDRESS
      }
      const data = await sesClient.send(new SendEmailCommand(params))
      // console.log('raw data', data)
      console.log('status', data['$metadata'].httpStatusCode)

      res.status(200).json({updated: true})
    } else {
      throw `Cannot use ${method} method for this route`
    }
  } catch (err) {
    console.log(err)
    if (typeof err === 'string') {
      res.status(400).json({ msg: err })
    } else {
      res.status(500).json({ msg: err.message || err})
    }
  }
})