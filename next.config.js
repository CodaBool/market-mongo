module.exports = {
  target: 'serverless',
  env: {
    NEXT_PUBLIC_STRIPE_PK: process.env.NEXT_PUBLIC_STRIPE_PK,
    NEXT_PUBLIC_STAGE: process.env.NEXT_PUBLIC_STAGE,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    MONGODB_URI: process.env.MONGODB_URI,
    STRIPE_SK: process.env.STRIPE_SK
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    NEXTAUTH_URL: 'https://d1m7a4gmurbqh2.cloudfront.net',
  },
};
