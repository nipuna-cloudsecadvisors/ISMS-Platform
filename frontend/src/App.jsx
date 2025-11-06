import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { authAPI } from './api';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Frameworks from './pages/Frameworks';
import Controls from './pages/Controls';
import Policies from './pages/Policies';
import PolicyView from './pages/PolicyView';
import Risks from './pages/Risks';
import Reports from './pages/Reports';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.getMe();
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          {(user.role === 'admin' || user.role === 'compliance_officer') && (
            <>
              <Route path="/users" element={<Users />} />
              <Route path="/frameworks" element={<Frameworks />} />
              <Route path="/controls" element={<Controls user={user} />} />
              <Route path="/policies" element={<Policies user={user} />} />
              <Route path="/risks" element={<Risks user={user} />} />
              <Route path="/reports" element={<Reports />} />
            </>
          )}
          {user.role === 'external_auditor' && (
            <>
              <Route path="/controls" element={<Controls user={user} readOnly />} />
              <Route path="/policies" element={<Policies user={user} readOnly />} />
              <Route path="/risks" element={<Risks user={user} readOnly />} />
              <Route path="/reports" element={<Reports />} />
            </>
          )}
          {user.role === 'employee' && (
            <>
              <Route path="/policies" element={<PolicyView />} />
            </>
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
