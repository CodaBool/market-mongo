import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema({
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    minlength: 8,
    trim: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  phone: {
    type: String,
    trim: true
  },
  image: String,
  name: String,
  customerId: String,
  admin: { 
    type: Boolean, 
    default: false 
  },
  trust: { 
    type: Number,
    default: 0
  },
  spent: { 
    type: Number,
    default: 0
  },
  shipping: mongoose.Mixed,
}, { timestamps: true })

const orderSchema = new Schema({
  _id: String, // replace with stripe intent id
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  email: String,
  vendor: String,
  id_customer: String,
  id_stripe_intent: String,
  id_stripe_payment_method: String,
  amount: Number,
  amount_received: {
    type: Number,
    default: 0
  },
  client_secret: String,
  currency: String,
  livemode: {
    type: String,
    default: process.env.NODE_ENV
  },
  pay_status: String,
  status: String,
  refunded: {
    type: Boolean,
    default: false
  },
  metadata: mongoose.Mixed,
  valid: mongoose.Mixed,
  shipping: mongoose.Mixed,
  charges: [mongoose.Mixed],
  items: [mongoose.Mixed]
}, { timestamps: true })

const accountSchema = new Schema({ any: {} })

const productSchema = new Schema({
  _id: {
    type: String,
    required: true
  },
  variants: [{
    name: String,
    images: [String],
    price: {
      type: Number,
      required: true
    },
    default: {
      type: Boolean,
      default: false
    },
    quantity: {
      type: Number,
      required: true
    }
  }],
  coverImg: String,
  currency: {
    type: String,
    default: 'USD'
  },
  description: {
    type: String,
    default: null
  },
  active: {
    type: Boolean,
    default: true
  },
  livemode: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

const reviewSchema = new Schema({
  productId: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  content: {
    type: String,
    maxlength: 3000
  },
  title: {
    type: String,
    maxlength: 75
  },
  stars: {
    type: Number,
    min: 0,
    max: 5,
  },
  variant: {
    image: String,
    name: String,
    _id: mongoose.Schema.Types.ObjectId
  },
  avatar: {
    type: String,
  },
  helpful: {
    type: Number,
    default: 0
  },
  published: {
    type: Boolean,
    default: false
  },
  archived: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

const tokenSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  token: { type: String, required: true },
  intent: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: '3m' }
  },
})

export const User = mongoose.models.user || mongoose.model('user', userSchema)
export const Order = mongoose.models.order || mongoose.model('order', orderSchema)
export const Review = mongoose.models.review || mongoose.model('review', reviewSchema)
export const Product = mongoose.models.product || mongoose.model('product', productSchema)
export const Account = mongoose.models.account || mongoose.model('account', accountSchema)
export const Token = mongoose.models.token || mongoose.model('token', tokenSchema)