# Features
- integrated with Stripe
- MongoDB (via Mongoose)
- next-auth for authentication
- Dev and Prod Deployments
  - uses Github Actions
  - uses Serverless Framework for simple deploys to AWS
    - uses the next component to utilize the full toolkit of Nextjs

# Contribute
## Errors
### Read CloudWatch Logs ([awslogs](https://github.com/jorgebastida/awslogs))
`pip install awslogs` 

`awslogs get "//aws\lambda\us-east-1.market-mongo-dev-api" --start='1h ago'`
### 503
- Give the lambda more memory in serverless.yml

### redux-persist failed to create sync storage. falling back to noop storage.
- use-shopping-cart is working on this issue as top priority
- Mean time ignore or comment out the login node_modules/use-shopping-cart/dis/react.js line 3030

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