const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { requirePremiumSubscription } = require('../middleware/aclMiddleware');

const { encryptWithAES } = require('../utils/cryptoUtils');
const { decodeToken } = require('../utils/tokenEncoding');
const User = require('../models/User');

// @route   GET api/content/premium
// @desc    Get premium content (Encrypted)
// @access  Private (Premium Subscription Required)
router.get('/premium', auth, requirePremiumSubscription, async (req, res) => {
    // --- BASE64 TOKEN VERIFICATION ---
    try {
        const user = await User.findById(req.user.id);

        if (!user.entitlementToken) {
            console.warn('[BASE64 ACCESS DENIED] No entitlement token found.');
            return res.status(403).json({ msg: 'Access Denied: Missing Entitlement Token' });
        }

        const decodedString = decodeToken(user.entitlementToken);
        console.log('\n--- [BASE64 TOKEN VERIFICATION] ---');
        console.log('Encoded Token:', user.entitlementToken);
        console.log('Decoded String:', decodedString);

        const [currUserId, featureId, plan, timestamp] = decodedString.split('|');

        if (currUserId !== user.id || plan !== 'PREMIUM') {
            console.log('Validation Status: ❌ FAILED');
            return res.status(403).json({ msg: 'Access Denied: Invalid Token' });
        }

        console.log('Validation Status: ✅ SUCCESS');
        console.log('-----------------------------------\n');

    } catch (err) {
        console.error('Token verification error', err);
        return res.status(500).send('Server Error');
    }

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
