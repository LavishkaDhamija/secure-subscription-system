import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const SubscriptionPage = () => {
    const { user, refreshUser } = useContext(AuthContext);
    const [message, setMessage] = useState('');

    const handleSubscribe = async (planName) => {
        try {
            const res = await axios.post('http://localhost:5000/api/subscriptions/subscribe', { planName });
            setMessage(res.data.msg);

            // Refresh user state to reflect new role immediately
            if (refreshUser) await refreshUser();

            alert('Subscription Updated! Access rights updated.');
        } catch (err) {
            setMessage('Error updating subscription');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Subscription Plans</h1>
            {message && <p style={{ color: 'green' }}>{message}</p>}

            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ border: '1px solid #ccc', padding: '20px' }}>
                    <h2>Free Tier</h2>
                    <p>Basic access to the platform.</p>
                    <button onClick={() => handleSubscribe('FREE')} disabled={user?.subscriptionPlan === 'FREE'}>
                        {user?.subscriptionPlan === 'FREE' ? 'Current Plan' : 'Downgrade to FREE'}
                    </button>
                </div>

                <div style={{ border: '1px solid gold', padding: '20px', background: '#fff9e6' }}>
                    <h2>Premium Tier</h2>
                    <p>Access to exclusive content.</p>
                    <button onClick={() => handleSubscribe('PREMIUM')} disabled={user?.subscriptionPlan === 'PREMIUM'}>
                        {user?.subscriptionPlan === 'PREMIUM' ? 'Current Plan' : 'Upgrade to PREMIUM'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;
