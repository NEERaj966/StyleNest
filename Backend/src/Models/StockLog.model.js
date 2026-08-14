import mongoose from 'mongoose'

const stockLogSchema = new mongoose.Schema(
  {
    foodCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodCard',
      required: true,
    },
    delta: {
      type: Number,
      required: true,
    },
    quantityBefore: {
      type: Number,
      required: true,
    },
    quantityAfter: {
      type: Number,
      required: true,
    },
    changeType: {
      type: String,
      enum: ['order_place', 'order_cancel', 'manual_update', 'admin_create'],
      required: true,
    },
    reason: {
      type: String,
      default: '',
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
)

export const StockLog = mongoose.model('StockLog', stockLogSchema)
