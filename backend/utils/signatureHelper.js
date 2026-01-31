const crypto = require('crypto');

/**
 * Generates a digital signature for a license.
 * Uses HMAC-SHA256 with the server's JWT_SECRET.
 * 
 * @param {Object} licenseData - The license object
 * @returns {String} The hex signature
 */
const generateLicenseSignature = (licenseData) => {
    // 1. Create Payload JSON with explicit field selection and formatting
    // Ensure dates are converted to ISO strings consistently
    const issuedAt = new Date(licenseData.issuedAt).toISOString();
    const approvedAt = new Date(licenseData.approvedAt).toISOString();

    // Construct object with keys in specific order we want
    const payload = {
        approvedAt: approvedAt,
        approvedBy: licenseData.approvedBy.toString(),
        issuedAt: issuedAt,
        licenseId: licenseData.licenseId,
        planType: licenseData.planType,
        userId: licenseData.userId.toString()
    };

    // Sort keys just to be absolutely sure (though object literal above helps)
    const sortedPayload = Object.keys(payload).sort().reduce((obj, key) => {
        obj[key] = payload[key];
        return obj;
    }, {});

    const payloadString = JSON.stringify(sortedPayload);

    console.log('[DEBUG] Signing Payload:', payloadString);

    // 2. Sign using HMAC-SHA256
    const secret = process.env.JWT_SECRET || 'default_secret';
    const signature = crypto
        .createHmac('sha256', secret)
        .update(payloadString)
        .digest('hex');

    console.log('[DEBUG] Generated Signature:', signature);

    return signature;
};

/**
 * Verifies a digital signature.
 * 
 * @param {Object} licenseData - The license object from DB
 * @param {String} existingSignature - The signature to verify against
 * @returns {Boolean} Valid or not
 */
const verifyLicenseSignature = (licenseData, existingSignature) => {
    try {
        console.log('[DEBUG] Verifying Signature...');
        const recomputedSignature = generateLicenseSignature(licenseData);

        console.log('[DEBUG] Existing Signature: ', existingSignature);
        console.log('[DEBUG] Recomputed Signature:', recomputedSignature);

        // Constant time comparison to prevent timing attacks
        return crypto.timingSafeEqual(
            Buffer.from(existingSignature, 'hex'),
            Buffer.from(recomputedSignature, 'hex')
        );
    } catch (err) {
        console.error('Signature verification error:', err);
        return false;
    }
};

module.exports = { generateLicenseSignature, verifyLicenseSignature };
