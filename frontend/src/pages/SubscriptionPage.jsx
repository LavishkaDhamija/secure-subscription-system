import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const SubscriptionPage = () => {
    const { user, refreshUser } = useContext(AuthContext);
    const [message, setMessage] = useState('');
    const [licenseStatus, setLicenseStatus] = useState(null); // 'pending', 'approved', or null
    const location = useLocation();

    React.useEffect(() => {
        if (location.state?.errorMsg) {
            setMessage(location.state.errorMsg);
        }

        const fetchLicense = async () => {
            if (user?.role === 'ADMIN') return;
            try {
                const res = await axios.get('http://localhost:5000/api/license/my');
                setLicenseStatus(res.data.status);
            } catch (err) {
                // Ignore 404
            }
        };
        fetchLicense();
    }, [location.state, user]);

    const handleSubscribe = async (planName) => {
        try {
            if (planName === 'PREMIUM') {
                const res = await axios.post('http://localhost:5000/api/subscriptions/request-premium');
                setMessage(res.data.msg);
                setLicenseStatus('pending');
            } else {
                // Handle Free Downgrade or other logic if needed (Assuming Free doesn't need approval)
                const res = await axios.post('http://localhost:5000/api/subscriptions/subscribe', { planName });
                setMessage(res.data.msg);
                if (refreshUser) await refreshUser();
            }
        } catch (err) {
            setMessage(err.response?.data?.msg || 'Error updating subscription');
        }
    };

    if (user?.role === 'ADMIN') {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h1 style={{ color: '#6b7280' }}>Administrator Access</h1>
                <p className="text-muted" style={{ fontSize: '1.1rem', marginTop: '10px' }}>
                    Admins do not need subscription plans. You have full system access by default.
                </p>
                <div style={{ marginTop: '20px' }}>
                    <a href="/admin" className="btn btn-primary">Go to Admin Console</a>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Manage Subscription</h1>
            {message && <div style={{ marginBottom: '20px', padding: '10px', background: '#d1fae5', color: '#065f46', borderRadius: '5px' }}>{message}</div>}

            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginTop: '2rem' }}>
                <div className="plan-card">
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Free Tier</h2>
                    <p className="text-muted">Basic access to the platform.</p>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', margin: '1.5rem 0', letterSpacing: '-0.02em' }}>$0<span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-muted)' }}>/mo</span></div>
                    <div style={{ marginTop: 'auto' }}>
                        <button
                            disabled={true}
                            className="btn btn-secondary"
                            style={{ width: '100%', cursor: 'not-allowed', opacity: 0.7 }}
                        >
                            {user?.subscriptionPlan === 'FREE' ? 'Current Plan' : 'Downgrade Disabled'}
                        </button>
                    </div>
                </div>

                <div className="plan-card premium">
                    {licenseStatus === 'pending' && <span className="badge badge-yellow" style={{ position: 'absolute', top: '20px', right: '20px' }}>Pending Approval</span>}
                    {user?.subscriptionPlan === 'PREMIUM' && <span className="badge badge-green" style={{ position: 'absolute', top: '20px', right: '20px' }}>Active</span>}

                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--warning-text)' }}>Premium Tier</h2>
                    <p className="text-muted">Access to exclusive content & features.</p>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', margin: '1.5rem 0', color: 'var(--warning-text)', letterSpacing: '-0.02em' }}>$20<span style={{ fontSize: '1rem', fontWeight: '500', opacity: 0.8 }}>/mo</span></div>

                    <div style={{ marginTop: 'auto' }}>
                        {user?.subscriptionPlan === 'PREMIUM' ? (
                            <button disabled className="btn btn-primary" style={{ width: '100%', opacity: 0.8 }}>
                                Premium Active
                            </button>
                        ) : licenseStatus === 'pending' ? (
                            <button disabled className="btn" style={{ width: '100%', background: 'var(--warning)', color: 'white' }}>
                                Request Pending...
                            </button>
                        ) : (
                            <button
                                onClick={() => handleSubscribe('PREMIUM')}
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                            >
                                Request Premium Access
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;
