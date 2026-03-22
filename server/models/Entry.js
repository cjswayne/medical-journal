const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  // Product
  productName: { type: String, required: true, trim: true },
  strains: [{
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['sativa', 'indica', 'hybrid', ''], default: '' }
  }],
  brand: { type: String, trim: true, default: '' },

  // Purchase
  purchaseDate: { type: Date, default: null },
  quantity: { type: Number, min: 0, default: null },
  price: { type: Number, min: 0, default: null },
  priceNotes: { type: String, default: '' },

  // Dispensary
  dispensary: {
    name: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' }
  },

  // Cannabis Form
  cannabisForm: {
    type: String,
    enum: ['', 'flower', 'oil', 'edible', 'extract', 'tincture', 'topical', 'other'],
    default: ''
  },
  customCannabisForm: { type: String, default: '' },
  cannabisFormNotes: { type: String, default: '' },

  // Consumption Method
  consumptionMethod: {
    type: String,
    enum: ['', 'smoke', 'vape', 'ingest', 'dab', 'sublingual', 'apply', 'other'],
    default: ''
  },
  customConsumptionMethod: { type: String, default: '' },
  consumptionMethodNotes: { type: String, default: '' },

  // Aromas
  aromas: [{
    name: { type: String, required: true },
    strength: { type: Number, min: 1, max: 10, required: true }
  }],
  aromaNotes: { type: String, default: '' },

  // Flavors
  flavors: [{
    name: { type: String, required: true },
    strength: { type: Number, min: 1, max: 10, required: true }
  }],
  flavorNotes: { type: String, default: '' },

  // Cannabinoids (all percentages 0-100)
  cannabinoids: {
    thc:  { type: Number, min: 0, max: 100, default: null },
    cbd:  { type: Number, min: 0, max: 100, default: null },
    thca: { type: Number, min: 0, max: 100, default: null },
    thcv: { type: Number, min: 0, max: 100, default: null },
    cbda: { type: Number, min: 0, max: 100, default: null },
    cbdv: { type: Number, min: 0, max: 100, default: null },
    cbg:  { type: Number, min: 0, max: 100, default: null },
    cbn:  { type: Number, min: 0, max: 100, default: null },
    cbc:  { type: Number, min: 0, max: 100, default: null }
  },

  // Terpenes
  terpenes: {
    dominant:  [{ type: String }],
    secondary: [{ type: String }]
  },

  // Dosage
  dosage: {
    amountConsumed:  { type: String, default: '' },
    timesTaken:      { type: Number, min: 1, default: null },
    timeToEffect:    { type: String, default: '' },
    lengthOfEffects: { type: String, default: '' }
  },

  // Effects (all 0-10 integers)
  effects: {
    painRelief:   { type: Number, min: 0, max: 10, default: 0 },
    headache:     { type: Number, min: 0, max: 10, default: 0 },
    energy:       { type: Number, min: 0, max: 10, default: 0 },
    creative:     { type: Number, min: 0, max: 10, default: 0 },
    stressRelief: { type: Number, min: 0, max: 10, default: 0 },
    dryMouth:     { type: Number, min: 0, max: 10, default: 0 },
    sleepy:       { type: Number, min: 0, max: 10, default: 0 },
    anxious:      { type: Number, min: 0, max: 10, default: 0 },
    crampRelief:  { type: Number, min: 0, max: 10, default: 0 },
    dryEyes:      { type: Number, min: 0, max: 10, default: 0 },
    lazy:         { type: Number, min: 0, max: 10, default: 0 },
    focused:      { type: Number, min: 0, max: 10, default: 0 },
    relaxation:   { type: Number, min: 0, max: 10, default: 0 },
    hungry:       { type: Number, min: 0, max: 10, default: 0 },
    uplifted:     { type: Number, min: 0, max: 10, default: 0 },
    peaceful:     { type: Number, min: 0, max: 10, default: 0 }
  },

  // Effect Notes
  symptomsRelievedNotes: { type: String, default: '' },
  otherEffectsNotes: { type: String, default: '' },

  // Ratings (0.0-10.0, step 0.1)
  medicalRating:      { type: Number, min: 0, max: 10, default: null },
  recreationalRating: { type: Number, min: 0, max: 10, default: null },

  // Images
  flowerImageUrl: { type: String, default: '' },
  coaImageUrls:   [{ type: String }]

}, { timestamps: true });

// Text index for search across key string fields
entrySchema.index({
  productName: 'text',
  brand: 'text',
  'dispensary.name': 'text',
  aromaNotes: 'text',
  flavorNotes: 'text',
  priceNotes: 'text'
});

module.exports = mongoose.model('Entry', entrySchema);
