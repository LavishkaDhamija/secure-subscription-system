// Utility for Base64 Encoding/Decoding of Entitlement Tokens

const encodeToken = (dataString) => {
    return Buffer.from(dataString).toString('base64');
};

const decodeToken = (encodedString) => {
    return Buffer.from(encodedString, 'base64').toString('utf8');
};

module.exports = {
    encodeToken,
    decodeToken
};
