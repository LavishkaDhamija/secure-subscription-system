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
        msg: 'Secure Premium Command Center',
        content: [
            {
                id: 1,
                title: 'Global Cyber Threat Forecast 2026',
                category: 'Threat Intelligence',
                body: 'Exclusive analysis of emerging AI-driven attack vectors targeting financial sectors. Includes localized heatmaps.',
                image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600',
                date: 'Oct 24, 2025'
            },
            {
                id: 2,
                title: 'High-Frequency Trading Algorithms',
                category: 'Market Alpha',
                body: 'Source code and documentation for our proprietary HFT production-ready modules. Optimized for nanosecond execution.',
                image: 'https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&q=80&w=600',
                date: 'Jan 15, 2026'
            },
            {
                id: 3,
                title: 'Enterprise Zero-Trust Blueprint',
                category: 'Architecture',
                body: 'Complete implementation guide for transitioning legacy networks to a Zero-Trust Architecture (ZTA).',
                image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600',
                date: 'Jan 28, 2026'
            },
            {
                id: 4,
                title: 'Crypto-Asset Volatility Report',
                category: 'Financial Analysis',
                body: 'Deep dive into liquidity pools and potential risks in the upcoming quarter. Premium subscriber access only.',
                image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=600',
                date: 'Jan 30, 2026'
            }
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
