const mongoose = require('mongoose');

const LicenseSchema = new mongoose.Schema({
    licenseId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    planType: {
        type: String,
        required: true,
        enum: ['FREE', 'PREMIUM'],
        default: 'PREMIUM'
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'approved', 'revoked'],
        default: 'pending'
    },
    issuedAt: {
        type: Date,
        default: Date.now
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },
    digitalSignature: {
        type: String,
        default: null
    },
    encodedLicenseId: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('License', LicenseSchema);
