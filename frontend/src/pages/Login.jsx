import { useState } from 'react';
import { authAPI } from '../api';
import { toast } from 'react-toastify';
import { FiShield, FiMail, FiLock } from 'react-icons/fi';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const { access_token, user } = response.data;
      onLogin(user, access_token);
      toast.success('Login successful!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem'
    }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <FiShield size={48} color="#4F46E5" style={{ margin: '0 auto 1rem' }} />
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            ISMS Platform
          </h1>
          <p style={{ color: 'var(--gray-600)' }}>
            Information Security Management System
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">
              <FiMail style={{ display: 'inline', marginRight: '0.5rem' }} />
              Email
            </label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@isms.local"
            />
          </div>

          <div className="form-group">
            <label className="label">
              <FiLock style={{ display: 'inline', marginRight: '0.5rem' }} />
              Password
            </label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: 'var(--gray-50)',
          borderRadius: '0.375rem',
          fontSize: '0.875rem'
        }}>
          <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Demo Accounts:</p>
          <p>Admin: admin@isms.local / admin123</p>
          <p>Compliance: compliance@isms.local / compliance123</p>
          <p>Auditor: auditor@external.com / auditor123</p>
          <p>Employee: employee@isms.local / employee123</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
