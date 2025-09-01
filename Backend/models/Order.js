const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  username: { type: String, required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price_at_time_paise: { type: Number, required: true } 
    }
  ],
  total_paise: { type: Number, required: true }, 
  status: { type: String, enum: ['pending', 'fulfilled', 'cancelled'], default: 'pending' },
  fulfilled_at: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
