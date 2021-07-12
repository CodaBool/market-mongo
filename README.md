# Features
- integrated with Stripe
- MongoDB (via Mongoose)
- next-auth for authentication
- Dev and Prod Deployments
  - uses Github Actions
  - uses Serverless Framework for simple deploys to AWS
    - uses the next component to utilize the full toolkit of Nextjs

# Start
1. git clone
2. npm i
3. create .env file and fill NEXT_PUBLIC_STRIPE_PK, STRIPE_SK, MONGODB_URI, RECAPTCHA_SK
> [create a secret](https://generate-secret.vercel.app/32) for the NEXTAUTH_SECRET

4. npm run dev

# Contribute
## Getting started
email `codabool@pm.me` or just do a pull request
## Errors
### Read CloudWatch Logs ([awslogs](https://github.com/jorgebastida/awslogs))
`pip install awslogs` 

`awslogs get "//aws\lambda\us-east-1.market-mongo-dev-api" --start='1h ago'`
### 503
- Give the lambda more memory in serverless.yml

### redux-persist failed to create sync storage. falling back to noop storage.
- use-shopping-cart is working on this issue

### Callback or Authentication issues
- The app uses a fork of next-auth
- This will result in bugs, for now just document and watch new threads until an official solution can be found for Serverless usecase
Runtime Environment Variables Issues
- https://github.com/nextauthjs/next-auth/issues/1156
- https://github.com/nextauthjs/next-auth/issues/969
- https://github.com/nextauthjs/next-auth/issues/1121
- https://github.com/nextauthjs/next-auth/issues/345
- https://github.com/nextauthjs/next-auth/issues/212
- https://github.com/nextauthjs/next-auth/issues/674


### [next-auth][warn][jwt_auto_generated_signing_key] 
- requires configuration [docs](https://next-auth.js.org/warnings#jwt_auto_generated_signing_key)

### Access Denied SQS
add line `"Action": "sqs:*"` to role policy

# Developer Notes
## TODO
- login
  - autofill email on failed attempt -> should be fixed, needs testing on dev
- email verification -> working local
- product review
  - review editing
  - admin publish
- receipts
- return???
- landing page
- product extras
  - size
  - color
  - pictures
  - description

## OAuth Providers
- Github
  - manage: https://github.com/settings/applications/1631352
  - allowed in local: Yes
- Facebook
  - manage: https://developers.facebook.com/apps (incognito)
  - allowed in local: No
- Google
  - manage: https://console.cloud.google.com/apis/credentials?authuser=1&project=market-mongo-314800
  - allowed in local: Yes
- Twitter
  - manage: https://developer.twitter.com/en/portal/projects/1397214706897756161/apps/20974732/keys
  - allowed in local: Yes
- Apple
  - denied: https://developer.apple.com/account/resources/identifiers/list/serviceId
  - status: https://developer.apple.com/enroll/identity/status
- Discord
  - manage: https://discord.com/developers/applications (incognito)
  - allowed in local: Yes