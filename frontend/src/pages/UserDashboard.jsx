import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
    const { user } = useContext(AuthContext);

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
