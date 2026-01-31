import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [licenses, setLicenses] = useState([]);
    const [msg, setMsg] = useState('');

    const fetchData = async () => {
        try {
            const [usersRes, licensesRes] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/users'),
                axios.get('http://localhost:5000/api/license/all')
            ]);
            setUsers(usersRes.data);
            setLicenses(licensesRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (user && user.role === 'ADMIN') {
            fetchData();
        }
    }, [user]);

    const approveLicense = async (licenseId) => {
        try {
            const res = await axios.post(`http://localhost:5000/api/license/approve/${licenseId}`);
            setMsg(`Success: ${res.data.msg}`);
            fetchData(); // Refresh both user roles and licenses
            setTimeout(() => setMsg(''), 5000);
        } catch (err) {
            console.error(err);
            setMsg('Error approving license');
        }
    };

    if (!user) return null;

    if (user.role !== 'ADMIN') {
        return (
            <div style={{ padding: '20px', color: 'red' }}>
                <h1>Access Denied</h1>
                <p>Protected Resource: Admin Dashboard</p>
                <p>Reason: Missing permissions</p>
            </div>
        );
    }

    const pendingLicenses = licenses.filter(l => l.status === 'pending');

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>Admin Dashboard</h1>

            {msg && <div style={{ marginBottom: '20px', padding: '10px', background: '#d1fae5', color: '#065f46', borderRadius: '5px' }}>{msg}</div>}

            <div style={{ marginBottom: '40px' }}>
                <h3>Pending License Requests ({pendingLicenses.length})</h3>
                {pendingLicenses.length === 0 ? (
                    <p className="text-muted">No pending requests.</p>
                ) : (
                    <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '20px', borderColor: '#e5e7eb' }}>
                        <thead style={{ background: '#f9fafb' }}>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Plan</th>
                                <th>License ID</th>
                                <th>Issued At</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingLicenses.map(l => (
                                <tr key={l._id}>
                                    <td>{l.userId?.username || 'Unknown'}</td>
                                    <td>{l.userId?.email || 'Unknown'}</td>
                                    <td>{l.planType}</td>
                                    <td style={{ fontFamily: 'monospace' }}>{l.licenseId}</td>
                                    <td>{new Date(l.issuedAt).toLocaleDateString()}</td>
                                    <td>
                                        <button
                                            onClick={() => approveLicense(l.licenseId)}
                                            style={{ background: '#10b981', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Approve & Sign
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <h3>All Users</h3>
            <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%', borderColor: '#e5e7eb' }}>
                <thead style={{ background: '#f9fafb' }}>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Subscription</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u._id}>
                            <td>{u.username}</td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                            <td>{u.subscriptionPlan}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;
