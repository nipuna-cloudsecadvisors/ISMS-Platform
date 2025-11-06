import { useState, useEffect } from 'react';
import { dashboardAPI, alertAPI } from '../api';
import { FiShield, FiAlertTriangle, FiFileText, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

function Dashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, alertsRes] = await Promise.all([
        dashboardAPI.getStats(),
        alertAPI.list()
      ]);
      setStats(statsRes.data);
      setAlerts(alertsRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!stats) {
    return <div>Failed to load dashboard data</div>;
  }

  // Employee-specific dashboard
  if (user.role === 'employee') {
    return (
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
          Welcome, {user.full_name}
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <FiFileText size={48} />
              <div>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.pending_acknowledgments}</h3>
                <p>Policies to Acknowledge</p>
              </div>
            </div>
          </div>

          {stats.compliance_progress.map((cp) => (
            <div key={cp.framework_id} className="card">
              <h3 style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
                Company Compliance Status
              </h3>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                {cp.framework_name}
              </h2>
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{
                  height: '8px',
                  backgroundColor: 'var(--gray-200)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${cp.progress_percentage}%`,
                    backgroundColor: 'var(--success)',
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                {cp.progress_percentage}% Complete ({cp.implemented_controls}/{cp.total_controls} controls)
              </p>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Your Action Items
          </h2>
          {stats.pending_acknowledgments > 0 ? (
            <div className="alert alert-info">
              <p>You have {stats.pending_acknowledgments} policy/policies that require your acknowledgment.</p>
              <p style={{ marginTop: '0.5rem' }}>
                Please visit the <a href="/policies" style={{ color: 'inherit', fontWeight: 'bold' }}>My Policies</a> page to review and acknowledge them.
              </p>
            </div>
          ) : (
            <div className="alert alert-success">
              <FiCheckCircle size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
              You're all caught up! No pending actions at this time.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Admin/Compliance/Auditor dashboard
  const riskData = [
    { name: 'High', value: stats.high_risks, color: '#EF4444' },
    { name: 'Medium', value: stats.medium_risks, color: '#F59E0B' },
    { name: 'Low', value: stats.low_risks, color: '#10B981' },
  ].filter(item => item.value > 0);

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        Dashboard
      </h1>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Total Risks</p>
              <h3 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.total_risks}</h3>
            </div>
            <FiAlertTriangle size={32} color="var(--primary)" />
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>High/Critical Risks</p>
              <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger)' }}>{stats.high_risks}</h3>
            </div>
            <FiAlertCircle size={32} color="var(--danger)" />
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Active Alerts</p>
              <h3 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.active_alerts}</h3>
            </div>
            <FiAlertCircle size={32} color="var(--warning)" />
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--info)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Controls Lacking Evidence</p>
              <h3 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.controls_lacking_evidence}</h3>
            </div>
            <FiShield size={32} color="var(--info)" />
          </div>
        </div>
      </div>

      {/* Compliance Progress */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          Compliance Progress
        </h2>
        {stats.compliance_progress.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.compliance_progress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="framework_name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="progress_percentage" fill="var(--primary)" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ color: 'var(--gray-600)' }}>No frameworks configured</p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Risk Distribution */}
        <div className="card">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            Risk Distribution
          </h2>
          {riskData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: 'var(--gray-600)' }}>No risks logged</p>
          )}
        </div>

        {/* Recent Alerts */}
        <div className="card">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            Active Alerts
          </h2>
          {alerts.length > 0 ? (
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              {alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    borderLeft: `3px solid ${
                      alert.severity === 'critical' ? 'var(--danger)' :
                      alert.severity === 'warning' ? 'var(--warning)' : 'var(--info)'
                    }`,
                    backgroundColor: 'var(--gray-50)',
                    borderRadius: '0.25rem'
                  }}
                >
                  <div style={{ fontWeight: '600' }}>{alert.title}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                    {alert.description}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                    {new Date(alert.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="alert alert-success">
              <FiCheckCircle size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
              No active alerts
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
