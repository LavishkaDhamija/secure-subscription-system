import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Shield, CreditCard, Lock, FileText, CheckCircle, ExternalLink } from 'lucide-react';

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [statusBadge, setStatusBadge] = useState({ text: 'LOADING...', class: 'badge-blue' });

    React.useEffect(() => {
        const fetchStatus = async () => {
            if (!user) return;
            // Default based on user role
            let badge = user.subscriptionPlan === 'PREMIUM'
                ? { text: 'PREMIUM ACTIVE', class: 'badge-green' }
                : { text: 'FREE PLAN', class: 'badge-blue' }; // Changed to blue/grey

            try {
                // Check for pending license
                if (user.subscriptionPlan !== 'PREMIUM') {
                    const res = await axios.get('http://localhost:5000/api/license/my');
                    if (res.data.status === 'pending') {
                        badge = { text: 'PENDING APPROVAL', class: 'badge-yellow' };
                    }
                }
            } catch (err) {
                // Ignore 404
            }
            setStatusBadge(badge);
        };
        fetchStatus();
    }, [user]);

    const verifyIntegrity = async () => {
        try {
            setVerificationStatus('Fetching active license...');

            // 1. Get License ID
            const licenseRes = await axios.get('http://localhost:5000/api/license/my');
            const license = licenseRes.data;

            if (!license || !license.licenseId) {
                setVerificationStatus('❌ No active license found to verify.');
                return;
            }

            setVerificationStatus(`Verifying License ID: ${license.licenseId}...`);

            // 2. Verify License Signature
            const res = await axios.get(`http://localhost:5000/api/license/verify/${license.licenseId}?t=${Date.now()}`);

            if (res.data.valid) {
                setVerificationStatus(`✅ ${res.data.message}\n\nSigned License ID: ${license.licenseId}\nTimestamp: ${license.approvedAt}`);
            } else {
                setVerificationStatus(`❌ Verification Failed: ${res.data.message}`);
            }

        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.msg || err.message || 'Unknown Error';
            setVerificationStatus(`❌ Verification Failed: ${errMsg}`);
        }
    };

    if (!user) return <div className="spinner"></div>;

    return (
        <div>
            <div className="mb-4">
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Dashboard</h1>
                <p className="text-muted">Welcome back, {user.username}</p>
            </div>

            <div className="dashboard-grid">
                {/* Profile Card */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h3 style={{ marginBottom: '5px' }}>Profile Status</h3>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <span className={`badge ${user.role === 'ADMIN' ? 'badge-yellow' : 'badge-blue'}`}>
                                    {user.role}
                                </span>
                                <span className={`badge ${statusBadge.class}`}>
                                    {statusBadge.text}
                                </span>
                            </div>
                        </div>
                        <Shield className="text-muted" size={24} />
                    </div>
                </div>

                {/* Subscription Action Card */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h3 style={{ marginBottom: '5px' }}>Subscription</h3>
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                {user.subscriptionPlan === 'PREMIUM'
                                    ? 'You have full access to premium features.'
                                    : 'Upgrade to unlock exclusive content.'}
                            </p>
                        </div>
                        <CreditCard className="text-muted" size={24} />
                    </div>
                    <div className="mt-4">
                        <Link to="/subscription" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                            Manage Plan
                        </Link>
                    </div>
                </div>

                {/* License Action Card */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h3 style={{ marginBottom: '5px' }}>License</h3>
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                Manage your software entitlement license.
                            </p>
                        </div>
                        <FileText className="text-muted" size={24} />
                    </div>
                    <div className="mt-4">
                        <Link to="/license" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                            View License
                        </Link>
                    </div>
                </div>
            </div>

            {/* Premium Content Banner */}
            {user.subscriptionPlan === 'PREMIUM' && (
                <div className="card" style={{ background: 'linear-gradient(to right, #4f46e5, #ec4899)', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ color: 'white', fontSize: '1.5rem' }}>Premium Access Unlocked</h2>
                            <p style={{ opacity: 0.9 }}>Access your exclusive secure content now.</p>
                        </div>
                        <Link to="/premium" className="btn" style={{ background: 'white', color: '#4f46e5' }}>
                            Access Content <ExternalLink size={16} />
                        </Link>
                    </div>
                </div>
            )}

            {/* Integrity Check */}
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <Lock size={20} className="text-muted" />
                    <h3 style={{ margin: 0 }}>Data Integrity Verification</h3>
                </div>
                <p className="text-muted mb-4">
                    Verify that your subscription record matches the digital signature on our secure ledger.
                </p>

                <button onClick={verifyIntegrity} className="btn btn-primary">
                    <CheckCircle size={18} /> Verify Subscription Integrity
                </button>

                {verificationStatus && (
                    <div style={{ marginTop: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #4f46e5' }}>
                        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.9rem', color: '#334155' }}>
                            {verificationStatus}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
