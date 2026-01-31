import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const { username, email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            await register(username, email, password);
            alert('Registration Successful. Please Login.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed');
        }
    };

    return (
        <div className="form-container">
            <div className="card">
                <div className="text-center mb-4">
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Create Account</h2>
                    <p className="text-muted">Join the secure platform today</p>
                </div>

                {error && (
                    <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            className="form-input"
                            type="text"
                            name="username"
                            value={username}
                            onChange={onChange}
                            placeholder="johndoe"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            className="form-input"
                            type="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            placeholder="name@company.com"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            className="form-input"
                            type="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            placeholder="Create a strong password"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">
                        Sign Up
                    </button>
                </form>
            </div>

            <p className="text-center text-muted">
                Already have an account? <a href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login</a>
            </p>
        </div>
    );
};

export default Register;
