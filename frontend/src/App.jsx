import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { Home, LogOut, User, Shield, Key, Layout, FileText } from 'lucide-react';

import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import SubscriptionPage from './pages/SubscriptionPage';
import PremiumContent from './pages/PremiumContent';
import AdminDashboard from './pages/AdminDashboard';
import LicensePage from './pages/LicensePage';
import AccessDenied from './pages/AccessDenied';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '6px', borderRadius: '8px', display: 'flex' }}>
          <Shield size={24} color="white" />
        </div>
        <span className="logo-text">SecureApp</span>
      </div>
      <div>
        {!user ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

            {/* User Links (Hidden for Admin) */}
            {user.role !== 'ADMIN' && (
              <>
                <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Home size={18} /> Dashboard
                </Link>
                <Link to="/license" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FileText size={18} /> License
                </Link>
              </>
            )}

            {/* Admin Links */}
            {user.role === 'ADMIN' && (
              <Link to="/admin" style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                <Key size={18} /> Admin Console
              </Link>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '24px', marginLeft: '12px', borderLeft: '2px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: 'var(--primary-light)', padding: '6px', borderRadius: '50%', color: 'white', display: 'flex' }}>
                  <User size={16} />
                </div>
                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{user.username}</span>
              </div>
              <button onClick={logout} className="btn" style={{ padding: '0.5rem', color: 'var(--text-light)', background: 'transparent', boxShadow: 'none' }} title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return (
    <div className="flex-center" style={{ height: '80vh' }}>
      <div className="spinner"></div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

const ProtectedPremiumRoute = ({ children }) => {
  const { user, loading, refreshUser } = useContext(AuthContext);
  const [isVerifying, setIsVerifying] = React.useState(true);

  React.useEffect(() => {
    const verifyAccess = async () => {
      if (user) {
        await refreshUser();
      }
      setIsVerifying(false);
    };
    verifyAccess();
  }, []); // Run once on mount to ensure latest role

  if (loading || isVerifying) return <div className="spinner"></div>;

  if (!user) return <Navigate to="/login" />;

  // Strict check: Only PREMIUM role allowed. Admins are blocked as per new strict rules.
  if (user.role !== 'PREMIUM') {
    return <Navigate to="/subscription" state={{ errorMsg: 'Premium license required — request approval first' }} />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <div className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
              <Route path="/subscription" element={<PrivateRoute><SubscriptionPage /></PrivateRoute>} />
              <Route path="/premium" element={<ProtectedPremiumRoute><PremiumContent /></ProtectedPremiumRoute>} />
              <Route path="/license" element={<PrivateRoute><LicensePage /></PrivateRoute>} />
              <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
              <Route path="/access-denied" element={<AccessDenied />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
