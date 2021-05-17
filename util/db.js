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

export function isValidObjectId(id) {
  return mongoose.isValidObjectId(id)
}

export function castToObjectId(string) {
  return mongoose.Types.ObjectId(string)
}

// TODO: replace for more security
// https://github.com/yahoo/serialize-javascript
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