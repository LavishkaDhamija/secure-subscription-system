const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { decryptAESKeyWithRSA } = require('../utils/cryptoUtils');

// Temporary in-memory store for session keys (User ID -> AES Key)
// Note: In production, use Redis or a secure session store
const sessionKeys = new Map();

// Accessor for other routes
router.getSessionKey = (userId) => sessionKeys.get(userId);

module.exports = (serverKeys) => {
    // @route   GET api/crypto/public-key
    // @desc    Get RSA Public Key
    // @access  Public
    router.get('/public-key', (req, res) => {
        res.json({ publicKey: serverKeys.publicKey });
    });

    // @route   POST api/crypto/session-key
    // @desc    Exchange AES Session Key
    // @access  Private
    router.post('/session-key', auth, (req, res) => {
        const { encryptedKey } = req.body;
        if (!encryptedKey) return res.status(400).json({ msg: 'No key provided' });

        try {
            const aesKey = decryptAESKeyWithRSA(encryptedKey, serverKeys.privateKey);
            sessionKeys.set(req.user.id.toString(), aesKey);

            console.log(`[CRYPTO] AES Session Key established for user: ${req.user.email}`);
            res.json({ msg: 'Session key established' });
        } catch (err) {
            console.error('Key exchange error:', err);
            res.status(500).json({ msg: 'Key exchange failed' });
        }
    });

    return router;
};
