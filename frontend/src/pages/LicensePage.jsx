import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FileText, CheckCircle, Clock, AlertTriangle, Shield, Copy } from 'lucide-react';

const LicensePage = () => {
    const { user } = useContext(AuthContext);
    const [license, setLicense] = useState(null);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);

    useEffect(() => {
        fetchLicense();
    }, []);

    const fetchLicense = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/license/my');
            setLicense(res.data);
        } catch (err) {
            // 404 is expected if no license exists yet
            if (err.response && err.response.status !== 404) {
                console.error(err);
            }
        } finally {
            setLoading(false);
        }
    };

    const requestLicense = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/license/request-premium');
            setMsg(res.data.msg);
            fetchLicense(); // Refresh data
        } catch (err) {
            console.error(err);
            setMsg(err.response?.data?.msg || 'Error requesting license');
        }
    };

    const verifySignature = async () => {
        if (!license) return;
        try {
            const res = await axios.get(`http://localhost:5000/api/license/verify/${license.licenseId}`);
            setVerificationResult(res.data);
        } catch (err) {
            console.error(err);
            setVerificationResult({ valid: false, message: 'Verification failed call' });
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved': return <span className="badge badge-green"><CheckCircle size={12} className="mr-1" /> Active</span>;
            case 'pending': return <span className="badge badge-yellow"><Clock size={12} className="mr-1" /> Pending Approval</span>;
            case 'revoked': return <span className="badge badge-red"><AlertTriangle size={12} className="mr-1" /> Revoked</span>;
            default: return <span className="badge badge-blue">{status}</span>;
        }
    };

    if (loading) return (
        <div className="flex-center" style={{ height: '50vh' }}>
            <div className="spinner"></div>
        </div>
    );

    return (
        <div className="form-container" style={{ maxWidth: '800px' }}>
            <div className="text-center mb-4">
                <h2><Shield className="inline-icon" size={28} /> Entitlement License</h2>
                <p className="text-muted">Manage your premium access credentials</p>
            </div>

            {msg && (
                <div style={{ background: '#d1fae5', color: '#065f46', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                    {msg}
                </div>
            )}

            {license ? (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                        <div>
                            <span className="text-muted text-sm">Plan Type</span>
                            <h3 style={{ margin: 0 }}>{license.planType}</h3>
                        </div>
                        <div>
                            {getStatusBadge(license.status)}
                        </div>
                    </div>

                    <div className="dashboard-grid" style={{ marginTop: '0', gap: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>
                        <div>
                            <label className="form-label text-muted">License ID</label>
                            <div style={{ display: 'flex', alignItems: 'center', background: '#f9fafb', padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb', fontFamily: 'monospace' }}>
                                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{license.licenseId}</span>
                            </div>
                        </div>
                        <div>
                            <label className="form-label text-muted">Issued Date</label>
                            <div style={{ padding: '8px 0' }}>
                                {new Date(license.issuedAt).toLocaleDateString()} {new Date(license.issuedAt).toLocaleTimeString()}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="form-label text-muted">Encoded License Token (Base64)</label>
                        <div style={{ background: '#111827', color: '#10b981', padding: '1rem', borderRadius: '0.5rem', fontFamily: 'monospace', wordBreak: 'break-all', fontSize: '0.85rem' }}>
                            {license.encodedLicenseId}
                        </div>
                        <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                            * This token is used for programmatic access validation.
                        </p>
                    </div>

                    {license.status === 'approved' && (
                        <div style={{ marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '15px' }}>
                            <h4 style={{ fontSize: '1rem', marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                                <Shield size={16} className="mr-1" color="#4f46e5" /> Digital Signature Verification
                            </h4>

                            <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: '1fr 1fr', fontSize: '0.9rem' }}>
                                <div>
                                    <span className="text-muted">Approved By:</span> <span style={{ fontFamily: 'monospace' }}>{license.approvedBy || 'Admin'}</span>
                                </div>
                                <div>
                                    <span className="text-muted">Signature:</span>
                                    <span style={{ fontFamily: 'monospace', marginLeft: '5px', background: '#f3f4f6', padding: '2px 5px', borderRadius: '4px' }} title={license.digitalSignature}>
                                        {license.digitalSignature ? `${license.digitalSignature.substring(0, 20)}...` : 'N/A'}
                                    </span>
                                </div>
                            </div>

                            <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button onClick={verifySignature} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <CheckCircle size={16} /> Verify Integrity
                                </button>
                                {verificationResult && (
                                    <span className={`badge ${verificationResult.valid ? 'badge-green' : 'badge-red'}`}>
                                        {verificationResult.message}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {license.status === 'pending' && (
                        <div style={{ marginTop: '20px', padding: '15px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', fontSize: '0.9rem', color: '#92400e' }}>
                            <strong>Note:</strong> Your license is currently awaiting administrator approval. Premium features may be restricted until approved.
                        </div>
                    )}
                </div>
            ) : (
                <div className="card text-center">
                    <div style={{ background: '#f3f4f6', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <FileText size={30} color="#6b7280" />
                    </div>
                    <h3>No Active License</h3>
                    <p className="text-muted mb-4">You do not have a license generated for your account yet.</p>

                    <a href="/subscription" className="btn btn-primary">
                        Manage Subscription to Request Access
                    </a>
                </div>
            )}
        </div>
    );
};

export default LicensePage;
