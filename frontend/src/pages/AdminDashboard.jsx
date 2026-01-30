import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/users');
                setUsers(res.data);
            } catch (err) {
                console.error(err);
                if (err.response && err.response.status === 403) {
                    // Normally handled by UI hiding, but if accessed directly:
                    // We can set a state to show denied message
                }
            }
        };

        if (user) {
            if (user.role === 'ADMIN') {
                fetchUsers();
            }
        }
    }, [user]);

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

    return (
        <div style={{ padding: '20px' }}>
            <h1>Admin Dashboard</h1>
            <h3>All Users</h3>
            <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
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
