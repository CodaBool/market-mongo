import applyMiddleware from '../../../util'
// import { getSession } from 'coda-auth/client'
import { Token, User } from '../../../models'
import  { SESClient, SendEmailCommand }  from  "@aws-sdk/client-ses"
// import sgMail from '@sendgrid/mail'
import { randString } from '../../../constants'
import { getSession } from 'coda-auth/client'

export default applyMiddleware(async (req, res) => {
  try {
    const { method, body, query } = req
    if (method === 'POST') {
      const session = await getSession({ req })
      if (!session) throw 'Unauthorized'
      const email = session.user.email
      console.log(`token attached to ${email}`)
      const token = randString(20)
      const user = await User.findById(session.id)
      console.log('user', user)
      if (!user) throw 'No User found'
      const newToken = await Token.create({ user: user._id, token, intent: 'verify' })
      console.log('newToken', newToken.token)
      // const to = 'codabool@protonmail.com'
      // const to = body.email
      const to = process.env.MY_EMAIL


      // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
      // const msg = {
      //   to, // Change to your recipient
      //   from: 'codabool@pm.me', // Change to your verified sender
      //   subject: 'Sending with SendGrid is Easier',
      //   text: 'and easy to do anywhere, even with Node.js',
      //   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
      // }
      // sgMail
      //   .send(msg)
      //   .then(response => {
      //     console.log(`${to} got email`, response)
      //   })
      //   .catch((error) => {
      //     console.error(error)
      //   })


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
                <strong>Verify your Email</strong> 
                <a href="http://localhost:3000/auth/verify?id=${newToken.token}">http://localhost:3000/auth/verify?id=${newToken.token}</p>
              `,
            },
            Text: {
              Charset: 'UTF-8',
              Data: 'TEXT_FORMAT_BODY1',
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: 'Verify Your Email',
          },
        },
        Source: 'codabool@pm.me', // SENDER_ADDRESS
      }
      const data = await sesClient.send(new SendEmailCommand(params))
      // console.log('raw data', data)
      console.log('status', data['$metadata'].httpStatusCode)

      res.status(200).json(newToken)
      // res.status(200).json({msg: 'ok'})
    } else if (method === 'GET') {
      // if (!query.id) throw 'No Token ID provided'
      // const token = await Token.findById(query.id)
      // if (!token) throw 'Your verification link may have expired. Please click on resend to verify your Email.'

      // METHOD 1 nodemailer-ses-transport
      // const transporter = nodemailer.createTransport(ses({
      //   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      // }))
      // transporter.sendMail({ 
      //   from: 'codabool@pm.me',
      //   to: 'codabool@pm.me',
      //   subject: 'subject',
      //   text: 'text here'
      // })

      // METHOD 2 Nodemailer example
      // const ses = new aws.SES({
      //   apiVersion: "2010-12-01",
      //   region: "us-east-1",
      // })
      // let transporter = nodemailer.createTransport({
      //   SES: { ses, aws },
      // })
      // transporter.sendMail(
      //   {
      //     from: "codabool@pm.me",
      //     to: "codabool@pm.me",
      //     subject: "Message",
      //     text: "I hope this message gets sent!",
      //     ses: {
      //       Tags: [
      //         {
      //           Name: "tag_name",
      //           Value: "tag_value",
      //         },
      //       ],
      //     },
      //   },
      //   (err, info) => {
      //     console.log(info.envelope);
      //     console.log(info.messageId);
      //   }
      // )

      // METHOD 3 AWS
      // https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/ses-examples-sending-email.html
      // CONFIRMED IN CONSOLE
      // const sesClient = new SESClient({ 
      //   apiKey: process.env.AWS_ACCESS_KEY_ID,
      //   apiSecret: process.env.AWS_SECRET_ACCESS_KEY,
      //   region: 'us-east-1'
      // })

      // const params = {
      //   Destination: {
      //     ToAddresses: ['codabool@pm.me']
      //   },
      //   Message: {
      //     Body: {
      //       Html: {
      //         Charset: 'UTF-8',
      //         Data: 'HTML_FORMAT_BODY',
      //       },
      //       Text: {
      //         Charset: 'UTF-8',
      //         Data: 'TEXT_FORMAT_BODY',
      //       },
      //     },
      //     Subject: {
      //       Charset: 'UTF-8',
      //       Data: 'EMAIL_SUBJECT',
      //     },
      //   },
      //   Source: 'codabool@pm.me', // SENDER_ADDRESS
      // }
      // const data = await sesClient.send(new SendEmailCommand(params))
      // console.log('data code', data['$metadata'].httpStatusCode)

      // create
      console.log('making token attached to test@user.com')
      const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
      const newToken = await Token.create({user: '60b6d42c209f720bf89dfc83', token})
      console.log('new token', newToken)

      res.status(200).json({msg: 'account verified'})
    } else if (method === 'PUT') {
      throw 'bad route'
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