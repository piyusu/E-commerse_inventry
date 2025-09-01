const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true, index: true },
  // price stored in cents to avoid floating rounding
  price_paise: { type: Number, required: true },
  stock_quantity: { type: Number, required: true, min: 0, default: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);