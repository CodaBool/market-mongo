module.exports = {
  target: 'serverless',
  env: {
    NEXT_PUBLIC_STRIPE_PK: process.env.NEXT_PUBLIC_STRIPE_PK,
    NEXT_PUBLIC_STAGE: process.env.NEXT_PUBLIC_STAGE,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    JWT_SIGNING_PK: process.env.JWT_SIGNING_PK,
    MONGODB_URI: process.env.MONGODB_URI,
    STRIPE_SK: process.env.STRIPE_SK,
  },
};
