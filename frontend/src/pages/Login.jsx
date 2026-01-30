import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '', otp: '' });
    const [step, setStep] = useState(1); // 1: Credentials, 2: OTP
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
                alert('OTP sent to console!'); // Feedback for user
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed');
        }
    };

    const onOtpSubmit = async e => {
        e.preventDefault();
        try {
            await verifyOtp(userId, otp);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Invalid OTP');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Login {step === 2 && '- MFA Verification'}</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {step === 1 ? (
                <form onSubmit={onLoginSubmit}>
                    <div>
                        <label>Email: </label>
                        <input type="email" name="email" value={email} onChange={onChange} required />
                    </div>
                    <div>
                        <label>Password: </label>
                        <input type="password" name="password" value={password} onChange={onChange} required />
                    </div>
                    <button type="submit">Get OTP</button>
                </form>
            ) : (
                <form onSubmit={onOtpSubmit}>
                    <p>Please enter the 6-digit OTP sent to your email (console).</p>
                    <div>
                        <label>OTP: </label>
                        <input type="text" name="otp" value={otp} onChange={onChange} maxLength="6" required />
                    </div>
                    <button type="submit">Verify & Login</button>
                    <button type="button" onClick={() => setStep(1)} style={{ marginLeft: '10px' }}>Back</button>
                </form>
            )}
        </div>
    );
};

export default Login;
