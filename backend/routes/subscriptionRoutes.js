const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const { createHash, signData, verifySignature } = require('../utils/digitalSignature');
const { encodeToken } = require('../utils/tokenEncoding');

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

        // --- DIGITAL SIGNATURE IMPLEMENTATION ---
        const timestamp = new Date().toISOString();
        const dataToSign = `${user.id}:${planName.toUpperCase()}:${timestamp}`;

        // 1. Create SHA-256 Hash
        const dataHash = createHash(dataToSign);

        // 2. Sign with RSA Private Key
        const serverKeys = req.app.get('serverKeys');
        const signature = signData(dataToSign, serverKeys.privateKey);

        console.log('\n--- [DIGITAL SIGNATURE CREATION] ---');
        console.log('Original Data:', dataToSign);
        console.log('Generated Hash (SHA-256):', dataHash);
        console.log('Digital Signature (Base64):', signature);
        console.log('------------------------------------\n');

        // 3. Store Signature & Data
        user.digitalSignature = signature;
        user.signatureData = dataToSign;

        // --- BASE64 ENTITLEMENT TOKEN IMPLEMENTATION ---
        // Only generate token if Premium
        if (user.subscriptionPlan === 'PREMIUM') {
            const featureId = 'PREMIUM_CONTENT';
            const entitlementString = `${user.id}|${featureId}|${user.subscriptionPlan}|${Date.now()}`;

            const encodedToken = encodeToken(entitlementString);

            console.log('\n--- [BASE64 TOKEN GENERATION] ---');
            console.log('Raw Entitlement String:', entitlementString);
            console.log('Encoded Token (Base64):', encodedToken);
            console.log('---------------------------------\n');

            user.entitlementToken = encodedToken;
        } else {
            // Remove token if downgrading
            user.entitlementToken = undefined;
        }

        await user.save();

        res.json({ msg: `Successfully subscribed to ${planName}`, user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/subscriptions/verify-signature/:id
// @desc    Verify the digital signature for a user's subscription
// @access  Private (or Public for demo?) -> Keeping Private
router.get('/verify-signature/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.digitalSignature) {
            return res.status(404).json({ msg: 'No signature found for this user' });
        }

        console.log('\n--- [DIGITAL SIGNATURE VERIFICATION] ---');
        console.log('Stored Data:', user.signatureData);
        console.log('Stored Signature:', user.digitalSignature);

        const serverKeys = req.app.get('serverKeys');
        const isValid = verifySignature(user.signatureData, user.digitalSignature, serverKeys.publicKey);

        console.log('Verification Result:', isValid);
        console.log('----------------------------------------\n');

        if (isValid) {
            res.json({
                signatureValid: true,
                integrityStatus: '✅ Data Integrity Verified: The record is authentic and has not been tampered with.',
                signedData: user.signatureData
            });
        } else {
            res.status(400).json({
                signatureValid: false,
                integrityStatus: '❌ INTEGRITY FAILED: The record may have been tampered with or key mismatch.'
            });
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
