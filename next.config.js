// FOR INFO
// {
//   key: 'Content-Security-Policy-Report-Only',
//   value: "default-src *; script-src 'self' *.stripe.com *.bootstrapcdn.com *.jquery.com * js.delivr.net; frame-src *.stripe.com; img-src * blob: data:; style-src 'self';", // .replace(/\n/g, '')
// }

// ATTEMPT 1
// const ContentSecurityPolicy = `
//   default-src 'self';
//   script-src 'self' 'unsafe-eval' 'unsafe-inline' *.stripe.com *.google-analytics.com *.googleapis.com;
//   child-src *.stripe.com
//   img-src * blob: data:;
//   frame-src *.stripe.com;
//   media-src 'none';
//   connect-src *;
//   font-src 'self';
//   style-src 'self' *;
// `
// ATTEMPT 2
// const ContentSecurityPolicy = `
//   default-src *;
//   script-src * 'unsafe-inline' 'unsafe-eval';
//   child-src *.stripe.com;
//   img-src * blob: data:;
//   frame-src *.stripe.com;
//   media-src *;
//   connect-src *;
//   font-src *;
//   style-src * 'unsafe-inline';
// `
// ATTEMPT 3
// const ContentSecurityPolicy = `
//   default-src 'self';
//   script-src 'self' 'unsafe-eval' 'unsafe-inline' *.stripe.com *.bootstrapcdn.com *.jquery.com * js.delivr.net;
//   child-src *.stripe.com;
//   frame-src *.stripe.com;
//   script-src-elem 'self' 'unsafe-eval' 'unsafe-inline';
//   img-src * blob: data:;
//   connect-src *;
//   font-src 'self';
//   media-src 'none';
//   style-src 'self' * 'unsafe-inline';
// `

const securityHeaders = [
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin', // strict-origin-when-cross-origin || origin-when-cross-origin
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy
  // {
  //   key: 'Permissions-Policy',
  //   value: 'fullscreen=(), sync-xhr(), web-share()', // previously added payment=(self),push(slef),notifications(slef),autoplay(slef),xr(slef)
  // },
  // {
  //   key: 'Content-Security-Policy',
  //   value: ContentSecurityPolicy.replace(/\n/g, ''),
  // }
];

module.exports = {
  target: 'serverless',
  env: {
    NEXT_PUBLIC_NEXTAUTH_URL: process.env.NEXT_PUBLIC_NEXTAUTH_URL,
    NEXT_PUBLIC_STRIPE_PK: process.env.NEXT_PUBLIC_STRIPE_PK,
    NEXT_PUBLIC_STAGE: process.env.NEXT_PUBLIC_STAGE,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    JWT_SIGNING_PK: process.env.JWT_SIGNING_PK,
    RECAPTCHA_SK: process.env.RECAPTCHA_SK,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    STRIPE_SK: process.env.STRIPE_SK,
    BUILD_ID: process.env.BUILD_ID,
  },
  images: {
    domains: ['files.stripe.com', 'dev.codattest.com'],
  },
  // async headers() {
  //   return [
  //     {
  //       source: '/',
  //       headers: securityHeaders
  //     },
  //     {
  //       source: '/:path*',
  //       headers: securityHeaders
  //     }
  //   ]
  // },
  // i18n: {
  //   locales: ['en-US'],
  //   defaultLocale: 'en-US',
  // },
};
