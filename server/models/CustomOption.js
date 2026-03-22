const mongoose = require('mongoose');

const customOptionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['aroma', 'flavor'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

// Prevent duplicate custom options per type
customOptionSchema.index({ type: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('CustomOption', customOptionSchema);
