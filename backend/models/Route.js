const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
  {
    area: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    routeNumber: { type: String, required: true, trim: true },
    truckNumber: { type: String, required: true, trim: true },
    collectionDays: { type: [String], required: true },
    collectionTime: { type: String, required: true },
    wasteType: { type: String, required: true },
    fee: { type: Number, required: true, min: 0 }, // LKR per month
  },
  { timestamps: true }
);

module.exports = mongoose.model('Route', routeSchema);
