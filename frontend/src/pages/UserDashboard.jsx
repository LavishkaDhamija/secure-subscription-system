import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const [verificationStatus, setVerificationStatus] = useState(null);

    const verifyIntegrity = async () => {
        try {
            setVerificationStatus('Verifying...');
            // Add timestamp to prevent caching
            const userId = user.id || user._id; // Handle both id and _id cases
            const res = await axios.get(`http://localhost:5000/api/subscriptions/verify-signature/${userId}?t=${Date.now()}`);
            setVerificationStatus(res.data.integrityStatus);
            if (res.data.signedData) {
                setVerificationStatus(prev => `${prev} \n\nVerified Record: [${res.data.signedData}]`);
            }
        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.msg || err.message || 'Unknown Error';
            setVerificationStatus(`❌ Verification Failed: ${errMsg}`);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>User Dashboard</h1>
            {user && (
                <div>
                    <p>Welcome, <strong>{user.username}</strong></p>
                    <p>Role: {user.role}</p>
                    {user.subscriptionPlan === 'PREMIUM' ? (
                        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff' }}>
                            <h3>Premium Perks Unlocked!</h3>
                            <p>You have access to exclusive features and content.</p>
                            <Link to="/premium">Go to Premium Content</Link>
                        </div>
                    ) : (
                        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff7e6', border: '1px solid #ffd591' }}>
                            <h3>Upgrade to Premium</h3>
                            <p>Get access to exclusive content and advanced features.</p>
                            <Link to="/subscription">View Plans</Link>
                        </div>
                    )}

                    {/* Integrated Digital Signature Verification Button */}
                    <div style={{ marginTop: '30px', padding: '20px', border: '2px dashed #ccc' }}>
                        <h3>🔐 Digital Signature Verification</h3>
                        <p>Ensure your subscription record is authentic and hasn't been tampered with.</p>
                        <button
                            onClick={verifyIntegrity}
                            style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '5px' }}
                        >
                            Verify Subscription Integrity
                        </button>
                        {verificationStatus && (
                            <div style={{ marginTop: '15px', fontWeight: 'bold' }}>
                                Result: {verificationStatus}
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <h3>Quick Links</h3>
                        <ul>
                            <li><Link to="/subscription">Manage Subscription</Link></li>
                            <li><Link to="/premium">Premium Content</Link></li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
