const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
    featureName: { type: String, required: true, unique: true },
    accessLevel: {
        type: String,
        enum: ['ALL', 'PREMIUM_ONLY', 'ADMIN_ONLY'],
        default: 'ALL'
    }
});

module.exports = mongoose.model('Feature', featureSchema);
