const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const auth = require('../middleware/authMiddleware');
const { requireAdminRole } = require('../middleware/aclMiddleware');
const License = require('../models/License');
const User = require('../models/User');
const { encodeToken } = require('../utils/tokenEncoding');


// @route   GET api/license/my
// @desc    Get current user's license
// @access  Private
router.get('/my', auth, async (req, res) => {
    try {
        // Find most recent license
        const license = await License.findOne({ userId: req.user.id }).sort({ issuedAt: -1 });

        if (!license) {
            return res.status(404).json({ msg: 'No license found' });
        }

        res.json(license);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

const { generateLicenseSignature, verifyLicenseSignature } = require('../utils/signatureHelper');

// @route   POST api/license/approve/:licenseId
// @desc    Approve a license and upgrade user
// @access  Private (Admin)
router.post('/approve/:licenseId', auth, requireAdminRole, async (req, res) => {
    try {
        const license = await License.findOne({ licenseId: req.params.licenseId });
        if (!license) return res.status(404).json({ msg: 'License not found' });

        if (license.status !== 'pending') {
            return res.status(400).json({ msg: `License is already ${license.status}` });
        }

        // 1. Update License Details
        license.status = 'approved';
        license.approvedBy = req.user.id;
        license.approvedAt = Date.now();

        // 2. Generate Digital Signature
        license.digitalSignature = generateLicenseSignature(license);

        await license.save();
        console.log("License saved:", license._id);

        // 3. Upgrade User Role
        const user = await User.findById(license.userId);
        let roleChanged = false;
        let updatedUserRole = 'FREE';

        if (user) {
            user.role = 'PREMIUM';
            user.subscriptionPlan = 'PREMIUM';

            // --- GENERATE ENTITLEMENT TOKEN ---
            // Required for accessing premium content route
            const featureId = 'PREMIUM_CONTENT';
            const entitlementString = `${user.id}|${featureId}|${user.subscriptionPlan}|${Date.now()}`;
            user.entitlementToken = encodeToken(entitlementString);

            await user.save();
            roleChanged = true;
            updatedUserRole = user.role;
        }

        res.json({
            msg: 'License approved and digitally signed',
            license,
            updatedUserRole,
            roleChanged
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/license/verify/:licenseId
// @desc    Verify license digital signature
// @access  Private
router.get('/verify/:licenseId', auth, async (req, res) => {
    try {
        const license = await License.findOne({ licenseId: req.params.licenseId });
        if (!license) return res.status(404).json({ msg: 'License not found' });

        // Access Control: Only Owner or Admin check? 
        // User asked: "Only license owner can view their license", but this is verify route.
        // Assuming verification is open to owner.
        if (license.userId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ msg: 'Not authorized to verify this license' });
        }

        if (!license.digitalSignature) {
            return res.json({ valid: false, message: 'No digital signature found on license' });
        }

        const isValid = verifyLicenseSignature(license, license.digitalSignature);

        if (isValid) {
            res.json({ valid: true, message: 'License integrity verified ✅' });
        } else {
            res.json({ valid: false, message: 'Tampering detected! Signature mismatch ❌' });
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/license/all
// @desc    Get all licenses (Admin only)
// @access  Private (Admin)
router.get('/all', auth, requireAdminRole, async (req, res) => {
    try {
        const licenses = await License.find().populate('userId', 'username email').sort({ issuedAt: -1 });
        res.json(licenses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
