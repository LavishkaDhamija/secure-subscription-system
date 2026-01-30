const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Placeholder: Security (Hashing) to be added later
  role: {
    type: String,
    enum: ['ADMIN', 'PREMIUM', 'FREE'],
    default: 'FREE'
  },
  subscriptionPlan: {
    type: String,
    enum: ['FREE', 'PREMIUM'],
    default: 'FREE'
  },
  otp: { type: String }, // Store hashed OTP ideally, but for simplicity: plain
  otpExpires: { type: Date },
  digitalSignature: { type: String }, // Stores the RSA signature of the subscription record
  signatureData: { type: String },    // Stores the original string that was signed
  entitlementToken: { type: String }  // Stores Base64 encoded entitlement token
});

// Pre-save hook to ensure Uppercase consistency for Role and SubscriptionPlan
userSchema.pre('save', function () {
  if (this.role) {
    this.role = this.role.toUpperCase().trim();
  }
  if (this.subscriptionPlan) {
    this.subscriptionPlan = this.subscriptionPlan.toUpperCase().trim();
  }
});

module.exports = mongoose.model('User', userSchema);
