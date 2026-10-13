const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['missed_pickup', 'illegal_dumping'], required: true },
    area: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    reporterName: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true }, // phone or email, used to look up reports
    status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
