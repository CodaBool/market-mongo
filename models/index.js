import mongoose, { Schema } from 'mongoose'

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
    required: true,
    minlength: 8,
    trim: true,
    required: true
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
  address: {
    name: {
      type: String,
      minlength: 2,
      maxlength: 35,
      trim: true
    },
    line1: {
      type: String,
      minlength: 3,
      maxlength: 60,
      trim: true
    },
    line2: {
      type: String,
      minlength: 3,
      maxlength: 50,
      trim: true
    },
    postalCode: Number,
    city: {
      type: String,
      minlength: 3,
      maxlength: 20,
      trim: true
    },
    country: {
      type: String,
      maxlength: 30,
      trim: true
    },
    state: {
      type: String,
      uppercase: true,
      minlength: 2,
      maxlength: 2,
      trim: true
    },
    phone: {
      type: String,
      minlength: 12,
      maxlength: 14
    }
  }
}, { timestamps: true })

const orderSchema = new Schema({
  intentId: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  amount: Number,
  status: String
}, { timestamps: true })

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


export const User = mongoose.models.user || mongoose.model('user', userSchema)
export const Order = mongoose.models.order || mongoose.model('order', orderSchema)
export const Review = mongoose.models.review || mongoose.model('review', reviewSchema)
export const Product = mongoose.models.product || mongoose.model('product', productSchema)