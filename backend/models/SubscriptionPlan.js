const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // e.g., 'Free', 'Premium'
    price: { type: Number, default: 0 },
    featuresAllowed: [{ type: String }] // List of feature names accessible
});

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
