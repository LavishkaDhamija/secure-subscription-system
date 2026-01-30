const crypto = require('crypto');

// Generate RSA Key Pair (to be called on startup)
const generateRSAKeyPair = () => {
    return crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });
};

// AES Encryption
const encryptWithAES = (data, key) => {
    // key should be 32 bytes for AES-256
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted
    };
};

// AES Decryption (for completeness, though backend mainly encrypts)
const decryptWithAES = (encryptedObj, key) => {
    const iv = Buffer.from(encryptedObj.iv, 'hex');
    const encryptedText = Buffer.from(encryptedObj.encryptedData, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
};

// RSA Decryption (for receiving the AES session key)
const decryptAESKeyWithRSA = (encryptedKey, privateKey) => {
    const buffer = Buffer.from(encryptedKey, 'base64');
    const decrypted = crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
        },
        buffer
    );
    return decrypted.toString('hex'); // Returning as hex for AES utilities
};

module.exports = {
    generateRSAKeyPair,
    encryptWithAES,
    decryptWithAES,
    decryptAESKeyWithRSA
};
