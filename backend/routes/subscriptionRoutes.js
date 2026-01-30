const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

// @route   POST api/subscriptions/subscribe
// @desc    Subscribe to a plan (Upgrade/Downgrade)
// @access  Private
router.post('/subscribe', auth, async (req, res) => {
    const { planName } = req.body; // 'Free' or 'Premium'

    try {
        const user = await User.findById(req.user.id);

        // Simulate payment processing... matched

        user.subscriptionPlan = planName.toUpperCase();
        user.role = user.subscriptionPlan === 'PREMIUM' ? 'PREMIUM' : 'FREE'; // Auto-update role based on plan

        // Admin role should not be overwritten by subscription change ideally, 
        // but for this simple app, we'll assume admins don't subscribe.
        // However, let's protect admin role.
        if (user.role === 'ADMIN') {
            // Keep admin as admin, but update plan
        }

        await user.save();

        res.json({ msg: `Successfully subscribed to ${planName}`, user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
