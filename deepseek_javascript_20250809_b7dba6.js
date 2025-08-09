// models/Lead.js
const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    business: { type: String, required: true },
    industry: { type: String, required: true },
    services: { type: [String], required: true },
    details: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lead', leadSchema);