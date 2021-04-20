import mongoose from 'mongoose'

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return
  return mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    },
    () => console.log('connected!')
  )
}

export function jparse(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export default async (req, res, next) => {
  try {
    if (!global.mongoose) {
      global.mongoose == connectDB()
    }
  } catch (e) {
    console.error(e)
  }
  return next()
}