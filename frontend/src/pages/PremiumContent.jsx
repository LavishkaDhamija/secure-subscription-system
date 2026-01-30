import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { decryptWithAES } from '../utils/cryptoHelper';

const PremiumContent = () => {
    const { user, sessionKey } = useContext(AuthContext);
    const [content, setContent] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/content/premium');
                let data = res.data;

                if (data.encrypted) {
                    console.log('[CRYPTO] Received Encrypted Payload:', data.data);
                    if (sessionKey) {
                        try {
                            const decrypted = await decryptWithAES(data.data, sessionKey);
                            console.log('[CRYPTO] Decryption Success:', decrypted);
                            setContent(decrypted);
                        } catch (decErr) {
                            console.error('[CRYPTO] Decryption Failed', decErr);
                            setError('Decryption Error: Key mismatch?');
                        }
                    } else {
                        setError('No session key available for decryption');
                    }
                } else {
                    console.log('[CRYPTO] Received Plain Payload (Fallback)');
                    setContent(data);
                }
            } catch (err) {
                console.error(err);
                if (err.response && err.response.status === 403) {
                    navigate('/access-denied');
                } else {
                    setError('Failed to load content');
                }
            }
        };

        if (user) {
            fetchContent();
        }
    }, [user, navigate, sessionKey]);

    if (error) return <div style={{ padding: '20px' }}>{error}</div>;

    if (!content) return <div style={{ padding: '20px' }}>Loading...</div>;

    return (
        <div style={{ padding: '20px', backgroundColor: '#e6ffe6' }}>
            <h1>{content.msg}</h1>
            <ul>
                {content.content.map(item => (
                    <li key={item.id}>
                        <strong>{item.title}</strong>: {item.body}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PremiumContent;
