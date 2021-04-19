const environment = 'us-east-1.market-mongo-prod-api'
if (environment.includes("-prod-")) {
  console.log('prod')
}
if (environment.includes("-dev-")) {
  console.log('dev')
}