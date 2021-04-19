// const { env } = process
// env.NEXTAUTH_URL = process.env.NEXTAUTH_URL

module.exports = {
  target: 'serverless',
  env: {
    NEXT_PUBLIC_STRIPE_PK: process.env.NEXT_PUBLIC_STRIPE_PK,
    NEXT_PUBLIC_STAGE: process.env.NEXT_PUBLIC_STAGE,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    MONGODB_URI: process.env.MONGODB_URI,
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    STRIPE_SK: process.env.STRIPE_SK,
  }
};
