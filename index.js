const environment = 'us-east-1.market-mongo-prod-api'
if (thing.includes("-prod-")) {
  console.log('prod')
}
if (thing.includes("-dev-")) {
  console.log('dev')
}