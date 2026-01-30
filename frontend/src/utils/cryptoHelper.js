// Utilities for Frontend Crypto using Web Crypto API

// Helper to convert PEM to ArrayBuffer for RSA import
function pemToArrayBuffer(pem) {
    const b64 = pem.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\n|\r/g, '');
    const binary = window.atob(b64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

// Generate AES-256 Key
export async function generateAESKey() {
    const key = await window.crypto.subtle.generateKey(
        { name: 'AES-CBC', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
    const exported = await window.crypto.subtle.exportKey('raw', key);
    return {
        cryptoKey: key,
        rawKeyHex: Array.from(new Uint8Array(exported))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
    };
}

// Encrypt AES Key with RSA Public Key
export async function encryptAESKeyWithRSA(aesRawKeyHex, rsaPublicKeyPEM) {
    const publicKeyBuffer = pemToArrayBuffer(rsaPublicKeyPEM);
    const publicKey = await window.crypto.subtle.importKey(
        'spki',
        publicKeyBuffer,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['encrypt']
    );

    // AES key is passed as hex, convert to buffer
    const aesBuffer = new Uint8Array(aesRawKeyHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

    const encrypted = await window.crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        publicKey,
        aesBuffer
    );

    return window.btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

// Decrypt data with AES Key
export async function decryptWithAES(encryptedObj, rawKeyHex) {
    const keyBuffer = new Uint8Array(rawKeyHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const key = await window.crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-CBC' },
        false,
        ['decrypt']
    );

    const iv = new Uint8Array(encryptedObj.iv.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const encryptedData = new Uint8Array(encryptedObj.encryptedData.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

    const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-CBC', iv: iv },
        key,
        encryptedData
    );

    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decrypted));
}
