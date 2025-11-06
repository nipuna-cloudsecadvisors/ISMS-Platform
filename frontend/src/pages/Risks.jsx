import { useState, useEffect } from 'react';
import { riskAPI, controlAPI, userAPI } from '../api';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';

function Risks({ user, readOnly }) {
  const [risks, setRisks] = useState([]);
  const [controls, setControls] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    likelihood: 3,
    impact: 3,
    category: '',
    status: 'identified',
    owner_id: '',
    control_ids: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [risksRes, controlsRes, usersRes] = await Promise.all([
        riskAPI.list(),
        controlAPI.list(),
        userAPI.list().catch(() => ({ data: [] }))
      ]);
      setRisks(risksRes.data);
      setControls(controlsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedRisk) {
        await riskAPI.update(selectedRisk.id, formData);
        toast.success('Risk updated successfully');
      } else {
        await riskAPI.create(formData);
        toast.success('Risk created successfully');
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this risk?')) {
      try {
        await riskAPI.delete(id);
        toast.success('Risk deleted');
        loadData();
      } catch (error) {
        toast.error('Failed to delete risk');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      likelihood: 3,
      impact: 3,
      category: '',
      status: 'identified',
      owner_id: '',
      control_ids: []
    });
    setSelectedRisk(null);
  };

  const openEditModal = (risk) => {
    setSelectedRisk(risk);
    setFormData({
      title: risk.title,
      description: risk.description || '',
      likelihood: risk.likelihood,
      impact: risk.impact,
      category: risk.category || '',
      status: risk.status,
      owner_id: risk.owner_id || '',
      control_ids: []
    });
    setShowModal(true);
  };

  const getRiskLevelBadge = (level) => {
    const badges = {
      critical: 'badge-danger',
      high: 'badge-danger',
      medium: 'badge-warning',
      low: 'badge-success'
    };
    return `badge ${badges[level] || 'badge-gray'}`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      identified: 'badge-info',
      in_progress: 'badge-warning',
      mitigated: 'badge-success',
      accepted: 'badge-gray',
      closed: 'badge-gray'
    };
    return `badge ${badges[status] || 'badge-gray'}`;
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  // Calculate risk statistics
  const riskStats = {
    total: risks.length,
    critical: risks.filter(r => r.risk_level === 'critical').length,
    high: risks.filter(r => r.risk_level === 'high').length,
    medium: risks.filter(r => r.risk_level === 'medium').length,
    low: risks.filter(r => r.risk_level === 'low').length,
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Risk Register</h1>
        {!readOnly && (
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <FiPlus /> Add Risk
          </button>
        )}
      </div>

      {/* Risk Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Total Risks</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{riskStats.total}</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Critical/High</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger)' }}>
            {riskStats.critical + riskStats.high}
          </div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Medium</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)' }}>
            {riskStats.medium}
          </div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Low</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>
            {riskStats.low}
          </div>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Likelihood</th>
              <th>Impact</th>
              <th>Risk Score</th>
              <th>Risk Level</th>
              <th>Status</th>
              <th>Owner</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {risks.map((risk) => {
              const owner = users.find(u => u.id === risk.owner_id);
              return (
                <tr key={risk.id}>
                  <td>
                    <div style={{ fontWeight: '600' }}>{risk.title}</div>
                    {risk.category && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                        {risk.category}
                      </div>
                    )}
                  </td>
                  <td>{risk.likelihood}/5</td>
                  <td>{risk.impact}/5</td>
                  <td style={{ fontWeight: '600' }}>{risk.risk_score}</td>
                  <td>
                    <span className={getRiskLevelBadge(risk.risk_level)}>
                      {risk.risk_level}
                    </span>
                  </td>
                  <td>
                    <span className={getStatusBadge(risk.status)}>
                      {risk.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{owner?.full_name || 'Unassigned'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {!readOnly ? (
                        <>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => openEditModal(risk)}
                          >
                            <FiEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(risk.id)}
                          >
                            <FiTrash2 />
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => {
                            setSelectedRisk(risk);
                            openEditModal(risk);
                          }}
                        >
                          View
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {readOnly ? 'View Risk' : selectedRisk ? 'Edit Risk' : 'Add Risk'}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">Title</label>
                <input
                  type="text"
                  className="input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  disabled={readOnly}
                />
              </div>
              <div className="form-group">
                <label className="label">Description</label>
                <textarea
                  className="textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={readOnly}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">Likelihood (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    className="input"
                    value={formData.likelihood}
                    onChange={(e) => setFormData({ ...formData, likelihood: parseInt(e.target.value) })}
                    required
                    disabled={readOnly}
                  />
                </div>
                <div className="form-group">
                  <label className="label">Impact (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    className="input"
                    value={formData.impact}
                    onChange={(e) => setFormData({ ...formData, impact: parseInt(e.target.value) })}
                    required
                    disabled={readOnly}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Category</label>
                <input
                  type="text"
                  className="input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Operational, Financial, Compliance"
                  disabled={readOnly}
                />
              </div>
              <div className="form-group">
                <label className="label">Status</label>
                <select
                  className="select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  disabled={readOnly}
                >
                  <option value="identified">Identified</option>
                  <option value="in_progress">In Progress</option>
                  <option value="mitigated">Mitigated</option>
                  <option value="accepted">Accepted</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">Owner</label>
                <select
                  className="select"
                  value={formData.owner_id}
                  onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                  disabled={readOnly}
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.full_name}</option>
                  ))}
                </select>
              </div>
              {!readOnly && (
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {selectedRisk ? 'Update' : 'Create'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Risks;
