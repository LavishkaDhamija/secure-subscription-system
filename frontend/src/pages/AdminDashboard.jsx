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
        <div>
            <div className="mb-4">
                <h1>Admin Dashboard</h1>
                <p className="text-muted">System Overview & License Management</p>
            </div>

            {msg && <div className="card" style={{ padding: '1rem', background: 'var(--success-bg)', color: 'var(--success-text)', border: 'none' }}>{msg}</div>}

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3>Pending License Requests</h3>
                    <span className="badge badge-yellow">{pendingLicenses.length} Pending</span>
                </div>

                {pendingLicenses.length === 0 ? (
                    <p className="text-muted">No pending requests awaiting approval.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
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
                                        <td style={{ fontWeight: 500 }}>{l.userId?.username || 'Unknown'}</td>
                                        <td className="text-muted">{l.userId?.email || 'Unknown'}</td>
                                        <td><span className="badge badge-blue">{l.planType}</span></td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{l.licenseId}</td>
                                        <td>{new Date(l.issuedAt).toLocaleDateString()}</td>
                                        <td>
                                            <button
                                                onClick={() => approveLicense(l.licenseId)}
                                                className="btn btn-primary"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                            >
                                                Approve
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>All Users</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
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
                                    <td style={{ fontWeight: 500 }}>{u.username}</td>
                                    <td className="text-muted">{u.email}</td>
                                    <td>
                                        <span className={`badge ${u.role === 'ADMIN' ? 'badge-purple' : u.role === 'PREMIUM' ? 'badge-blue' : 'badge-gray'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td>
                                        {u.subscriptionPlan === 'PREMIUM' ? (
                                            <span className="badge badge-blue">PREMIUM</span>
                                        ) : (
                                            <span className="badge badge-gray">FREE</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
