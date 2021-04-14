import mongoose from 'mongoose'
// import fs from 'fs'

// const ca = [fs.readFileSync('rds-combined-ca-bundle.pem')]

export default async () => {
  console.log('MONGODB_URI =', process.env.MONGODB_URI)
  if (mongoose.connection.readyState >= 1) return
  return mongoose.connect(
    process.env.MONGODB_URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    },
    () => console.log('connected!')
  )
}
