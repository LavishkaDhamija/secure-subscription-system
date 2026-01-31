import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '', otp: '' });
    const [step, setStep] = useState(1);
    const [userId, setUserId] = useState(null);
    const { login, verifyOtp } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const { email, password, otp } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onLoginSubmit = async e => {
        e.preventDefault();
        try {
            const res = await login(email, password);
            if (res.otpRequired) {
                setUserId(res.userId);
                setStep(2);
                setError('');
                alert('OTP sent to console!');
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed');
        }
    };

    const onOtpSubmit = async e => {
        e.preventDefault();
        try {
            const data = await verifyOtp(userId, otp);
            if (data.user && data.user.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Invalid OTP');
        }
    };

    return (
        <div className="form-container">
            <div className="card">
                <div className="text-center mb-4">
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                        {step === 1 ? 'Welcome Back' : 'Two-Factor Auth'}
                    </h2>
                    <p className="text-muted">
                        {step === 1 ? 'Sign in to your secure account' : 'Enter the verification code'}
                    </p>
                </div>

                {error && (
                    <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={onLoginSubmit}>
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
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block">
                            Authorize Login
                        </button>
                    </form>
                ) : (
                    <form onSubmit={onOtpSubmit}>
                        <div className="form-group">
                            <label className="form-label">Authentication Code</label>
                            <input
                                className="form-input"
                                type="text"
                                name="otp"
                                value={otp}
                                onChange={onChange}
                                maxLength="6"
                                placeholder="Enter 6-digit OTP"
                                style={{ letterSpacing: '0.2rem', textAlign: 'center', fontSize: '1.2rem' }}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block">
                            Verify Identity
                        </button>
                        <button type="button" onClick={() => setStep(1)} className="btn btn-secondary btn-block mt-4">
                            Back to Login
                        </button>
                    </form>
                )}
            </div>

            <p className="text-center text-muted">
                Don't have an account? <a href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Register</a>
            </p>
        </div>
    );
};

export default Login;
