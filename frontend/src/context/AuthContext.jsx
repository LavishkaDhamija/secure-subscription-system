import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

import { generateAESKey, encryptAESKeyWithRSA } from '../utils/cryptoHelper';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionKey, setSessionKey] = useState(null);

    const performKeyExchange = async () => {
        try {
            console.log('[CRYPTO] Starting Key Exchange...');
            // 1. Fetch Server Public Key
            const pkRes = await axios.get('http://localhost:5000/api/crypto/public-key');
            const publicKey = pkRes.data.publicKey;
            console.log('[CRYPTO] Server Public Key received');

            // 2. Generate AES Session Key
            const { rawKeyHex } = await generateAESKey();
            console.log('[CRYPTO] AES Session Key generated locally');

            // 3. Encrypt AES Key with RSA Public Key
            const encryptedKey = await encryptAESKeyWithRSA(rawKeyHex, publicKey);
            console.log('[CRYPTO] AES Key encrypted with RSA');

            // 4. Send to Server
            await axios.post('http://localhost:5000/api/crypto/session-key', { encryptedKey });
            console.log('[CRYPTO] Session Key exchanged successfully');

            setSessionKey(rawKeyHex);
        } catch (err) {
            console.error('[CRYPTO] Key Exchange failed', err);
        }
    };

    const checkUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            // Set global header
            axios.defaults.headers.common['x-auth-token'] = token;
            try {
                const res = await axios.get('http://localhost:5000/api/auth/user');
                setUser(res.data);

                // Only perform key exchange if we don't have one, or if we want to ensure fresh key on reload
                // For now, let's keep it simple: if we have a user, ensure we have a key.
                if (!sessionKey) {
                    performKeyExchange();
                }
            } catch (error) {
                console.error('Auth verification failed', error);
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['x-auth-token'];
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        checkUser();
    }, []);

    const login = async (email, password) => {
        const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        // NOTE: We do NOT set token here anymore. We wait for OTP.
        return res.data;
    };

    const verifyOtp = async (userId, otp) => {
        const res = await axios.post('http://localhost:5000/api/auth/verify-otp', { userId, otp });
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['x-auth-token'] = res.data.token;
        setUser(res.data.user);
        // Important: Perform key exchange right after successful login
        performKeyExchange();
        return res.data;
    };

    const register = async (username, email, password) => {
        const res = await axios.post('http://localhost:5000/api/auth/register', { username, email, password });
        // No auto-login on register anymore.
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['x-auth-token'];
        setUser(null);
        setSessionKey(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, verifyOtp, register, logout, loading, refreshUser: checkUser, sessionKey }}>
            {children}
        </AuthContext.Provider>
    );
};
