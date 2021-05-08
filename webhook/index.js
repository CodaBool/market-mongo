const express = require("express")
const app = express()

app.get("/", (req, res) => {
  res.send('create an .env file if needed')
})

app.listen(3001, () =>
  console.log(`---> http://localhost:${3001}`)
)

module.exports = app