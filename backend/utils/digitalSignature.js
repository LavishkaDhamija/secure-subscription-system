const crypto = require('crypto');

// 1. Create Hash (SHA-256)
const createHash = (data) => {
    return crypto.createHash('sha256').update(data).digest('hex');
};

// 2. Sign Data (RSA Private Key)
const signData = (data, privateKey) => {
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    sign.end();
    // Return signature in Base64
    return sign.sign(privateKey, 'base64');
};

// 3. Verify Signature (RSA Public Key)
const verifySignature = (data, signature, publicKey) => {
    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    verify.end();
    return verify.verify(publicKey, signature, 'base64');
};

module.exports = {
    createHash,
    signData,
    verifySignature
};
