# Features
- integrated with Stripe
- MongoDB (via Mongoose)
- Next-Auth for authentication
- Dev and Prod Deployments
  - uses Github Actions
  - uses Serverless Framework for simple deploys to AWS
    - uses the next component to utilize the full toolkit of Nextjs


# Dev Notes
- verify that code is on the server with this if
```js
if (!process.browser) {
  console.log("my secret", process.env.SECRET);
}
```

## NEXTAUTH_URL Fix
"lint": "eslint --fix . && echo 'Lint Complete.'",
"dev": "cross-env NEXT_PUBLIC_STAGE=dev NEXTAUTH_URL=http://localhost:3000 next dev",
"build": "cross-env NEXTAUTH_URL=https://dev.codattest.com next build",
"build:dev": "cross-env NEXT_PUBLIC_STAGE=dev NEXTAUTH_URL=https://dev.codattest.com next build",
"build:prod": "cross-env NEXT_PUBLIC_STAGE=prod NEXTAUTH_URL=https://www.codattest.com next build",
"watch": "watch 'clear && npm run -s test | tap-nirvana && npm run -s lint' src",
"start": "next start",
"export": "next export"