import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import SubscriptionPage from './pages/SubscriptionPage';
import PremiumContent from './pages/PremiumContent';
import AdminDashboard from './pages/AdminDashboard';

import AccessDenied from './pages/AccessDenied';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav style={{ padding: '10px', backgroundColor: '#333', color: '#fff', marginBottom: '20px' }}>
      <Link to="/dashboard" style={{ color: 'white', marginRight: '15px' }}>Home</Link>
      {!user ? (
        <>
          <Link to="/login" style={{ color: 'white', marginRight: '15px' }}>Login</Link>
          <Link to="/register" style={{ color: 'white' }}>Register</Link>
        </>
      ) : (
        <>
          <span style={{ marginRight: '15px' }}>Hello, {user.username} ({user.role})</span>
          {user.role === 'ADMIN' && <Link to="/admin" style={{ color: '#ffcc00', marginRight: '15px' }}>Admin Panel</Link>}
          <button onClick={logout} style={{ background: 'red', color: 'white', border: 'none', padding: '5px' }}>Logout</button>
        </>
      )}
    </nav>
  );
};

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
          <Route path="/subscription" element={<PrivateRoute><SubscriptionPage /></PrivateRoute>} />
          <Route path="/premium" element={<PrivateRoute><PremiumContent /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
