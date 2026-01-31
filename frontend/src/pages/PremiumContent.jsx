import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { decryptWithAES } from '../utils/cryptoHelper';
import { Lock, Unlock, Download, Eye, FileText, Activity } from 'lucide-react';

const PremiumContent = () => {
    const { user, sessionKey } = useContext(AuthContext);
    const [content, setContent] = useState(null);
    const [error, setError] = useState(null);
    const [isDecrypting, setIsDecrypting] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // Simulate network/decryption delay for "effect"
                await new Promise(r => setTimeout(r, 800));

                const res = await axios.get('http://localhost:5000/api/content/premium');
                let data = res.data;

                if (data.encrypted) {
                    console.log('[CRYPTO] Received Encrypted Payload');
                    if (sessionKey) {
                        try {
                            const decrypted = await decryptWithAES(data.data, sessionKey);
                            console.log('[CRYPTO] Decryption Success');
                            setContent(decrypted);
                        } catch (decErr) {
                            console.error('[CRYPTO] Decryption Failed', decErr);
                            setError('Decryption Error: Key mismatch?');
                        }
                    } else {
                        setError('No session key available for decryption');
                    }
                } else {
                    setContent(data);
                }
            } catch (err) {
                console.error(err);
                if (err.response && err.response.status === 403) {
                    navigate('/access-denied');
                } else {
                    setError('Failed to load content');
                }
            } finally {
                setIsDecrypting(false);
            }
        };

        if (user) {
            fetchContent();
        }
    }, [user, navigate, sessionKey]);

    if (error) return (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--danger)' }}>
            <Lock size={48} style={{ marginBottom: '20px' }} />
            <h2>Access Blocked</h2>
            <p>{error}</p>
        </div>
    );

    if (isDecrypting || !content) return (
        <div className="flex-center" style={{ flexDirection: 'column', height: '60vh' }}>
            <div className="spinner" style={{ width: '60px', height: '60px' }}></div>
            <h3 style={{ marginTop: '20px', color: 'var(--primary)' }}>
                Decrypting Secure Channel...
            </h3>
        </div>
    );

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            {/* Hero Section */}
            <div style={{
                background: 'var(--primary)',
                borderRadius: '1.5rem',
                padding: '4rem 2rem',
                color: 'white',
                marginBottom: '3rem',
                textAlign: 'center',
                boxShadow: 'var(--shadow-md)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(45deg, rgba(82, 115, 142, 0.4) 0%, transparent 100%)', opacity: 0.3 }}></div>
                <div style={{ position: 'relative', zIndex: 10 }}>
                    <div style={{ display: 'inline-flex', padding: '8px 16px', background: 'rgba(255,255,255,0.15)', borderRadius: '20px', marginBottom: '1rem', backdropFilter: 'blur(5px)' }}>
                        <Unlock size={16} style={{ marginRight: '8px' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px' }}>SECURE CONNECTION ESTABLISHED</span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', color: 'white' }}>{content.msg}</h1>
                    <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
                        Welcome to your encrypted workspace. All data below is transmitted securely using AES-256 encryption.
                    </p>
                </div>
            </div>

            {/* Content Grid */}
            <div className="dashboard-grid" style={{ gap: '2rem' }}>
                {content.content.map((item, index) => (
                    <div key={item.id} className="card" style={{
                        padding: '0',
                        border: 'none',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        cursor: 'default',
                        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s backwards`
                    }}>
                        {/* Image Header */}
                        <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                            <img src={item.id === 2 ? 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&q=80&w=600' : item.image}
                                alt={item.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'scale(1.0)'}
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600'; }} // Fallback
                            />
                            <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
                                <span className="badge" style={{ background: 'rgba(0,0,0,0.6)', color: 'white', backdropFilter: 'blur(4px)' }}>
                                    {item.category}
                                </span>
                            </div>
                        </div>

                        {/* Card Body */}
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 600 }}>{item.date}</span>
                                <Activity size={16} color="var(--success-text)" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', lineHeight: 1.3 }}>{item.title}</h3>
                            <p className="text-muted" style={{ fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                                {item.body}
                            </p>

                            {/* Interactive Actions */}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.9rem', padding: '0.6rem' }}>
                                    <Eye size={16} /> View
                                </button>
                                <button className="btn btn-secondary" style={{ flex: 1, fontSize: '0.9rem', padding: '0.6rem' }}>
                                    <Download size={16} /> Export
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default PremiumContent;
