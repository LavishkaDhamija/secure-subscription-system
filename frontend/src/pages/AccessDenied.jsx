import React from 'react';
import { Link } from 'react-router-dom';

const AccessDenied = () => {
    return (
        <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
            <h1>403 - Access Denied</h1>
            <p>You do not have permission to view this resource.</p>
            <p>Please contact your administrator or upgrade your plan.</p>
            <Link to="/dashboard">Go back to Dashboard</Link>
        </div>
    );
};

export default AccessDenied;
