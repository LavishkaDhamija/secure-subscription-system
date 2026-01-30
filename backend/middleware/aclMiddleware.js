const User = require('../models/User');

// Middleware to require Admin Role
const requireAdminRole = async (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({
            msg: 'Access denied: Admin role required',
            detail: 'You do not have the necessary administrative privileges.'
        });
    }
    next();
};

// Middleware to require Premium Subscription
// This check is independent of the Role (Admins must also be Premium to see premium content)
const requirePremiumSubscription = async (req, res, next) => {
    if (!req.user || req.user.subscriptionPlan !== 'PREMIUM') {
        return res.status(403).json({
            msg: 'Access denied: Premium subscription required',
            detail: 'This feature is only available to users on the PREMIUM plan.'
        });
    }
    next();
};

module.exports = { requireAdminRole, requirePremiumSubscription };
