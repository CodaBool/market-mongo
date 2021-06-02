import mongoose, { Schema } from 'mongoose'

// const chargeSchema = new Schema({ 
//   _id: String,
//   id_payment_intent: String,
//   id_payment_method: String,
//   id_customer: String,
//   amount: Number,
//   amount_captured: Number,
//   amount_refunded: Number,
//   captured: Number,
//   created: Number,
//   currency: String,
//   paid: Boolean,
//   receipt_url: String,
//   refunded: Boolean,
//   status: String,
//   risk: String,
// })

// Extend the built-in models using class inheritance

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    minlength: 8,
    trim: true
  },
  provider: String,
  phone: {
    type: String,
    trim: true
  },
  customerId: { 
    type: String
  },
  admin: { 
    type: Boolean, 
    default: false 
  },
  active: { 
    type: Boolean, 
    default: true
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
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: null
  },
  currency: {
    type: String,
    default: 'USD'
  },
  images: {
    type: [String],
    default: []
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
    maxlength: 2000,
    required: true
  },
  stars: {
    type: Number,
    min: 0,
    max: 5,
  },
  image: {
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


// export const oldUser = mongoose.models.user || mongoose.model('user', depreciatedUserSchema)
export const User = mongoose.models.user || mongoose.model('user', userSchema)
export const Order = mongoose.models.order || mongoose.model('order', orderSchema)
export const Review = mongoose.models.review || mongoose.model('review', reviewSchema)
export const Product = mongoose.models.product || mongoose.model('product', productSchema)
export const Account = mongoose.models.account || mongoose.model('account', accountSchema)