const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { requirePremiumSubscription } = require('../middleware/aclMiddleware');

const { encryptWithAES } = require('../utils/cryptoUtils');

// @route   GET api/content/premium
// @desc    Get premium content (Encrypted)
// @access  Private (Premium Subscription Required)
router.get('/premium', auth, requirePremiumSubscription, (req, res) => {
    const content = {
        msg: 'Welcome to the Premium Content!',
        content: [
            { id: 1, title: 'Exclusive Market Analysis', body: 'The market is trending upwards due to...' },
            { id: 2, title: 'Advanced Security Reports', body: 'New vulnerabilities found in...' },
            { id: 3, title: 'Priority Support Channel', body: 'Contact us at vip@support.com' }
        ]
    };

    // Try to encrypt if a session key exists
    const cryptoRoutes = req.app.get('cryptoRoutes');
    const sessionKey = cryptoRoutes.getSessionKey(req.user.id.toString());

    if (sessionKey) {
        console.log(`[CRYPTO] Encrypting premium content for user: ${req.user.email}`);
        const encrypted = encryptWithAES(content, sessionKey);
        res.json({ encrypted: true, data: encrypted });
    } else {
        console.warn(`[CRYPTO] No session key for user ${req.user.email}, sending plain (fallback)`);
        res.json(content);
    }
});

module.exports = router;
