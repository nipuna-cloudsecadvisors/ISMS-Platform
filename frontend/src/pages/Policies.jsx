import { useState, useEffect } from 'react';
import { policyAPI, reportAPI } from '../api';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit, FiTrash2, FiSend, FiBarChart2, FiEye } from 'react-icons/fi';

function Policies({ user, readOnly }) {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [report, setReport] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    version: '1.0'
  });

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      const res = await policyAPI.list();
      setPolicies(res.data);
    } catch (error) {
      toast.error('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedPolicy) {
        await policyAPI.update(selectedPolicy.id, formData);
        toast.success('Policy updated successfully');
      } else {
        await policyAPI.create(formData);
        toast.success('Policy created successfully');
      }
      setShowModal(false);
      resetForm();
      loadPolicies();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handlePublish = async (id) => {
    if (window.confirm('Publishing will require all employees to acknowledge this policy. Continue?')) {
      try {
        await policyAPI.publish(id);
        toast.success('Policy published successfully');
        loadPolicies();
      } catch (error) {
        toast.error('Failed to publish policy');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      try {
        await policyAPI.delete(id);
        toast.success('Policy deleted');
        loadPolicies();
      } catch (error) {
        toast.error('Failed to delete policy');
      }
    }
  };

  const handleViewReport = async (policy) => {
    try {
      const res = await reportAPI.policyAcknowledgment(policy.id);
      setReport(res.data);
      setSelectedPolicy(policy);
      setShowReportModal(true);
    } catch (error) {
      toast.error('Failed to load report');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      version: '1.0'
    });
    setSelectedPolicy(null);
  };

  const openEditModal = (policy) => {
    setSelectedPolicy(policy);
    setFormData({
      title: policy.title,
      content: policy.content,
      version: policy.version
    });
    setShowModal(true);
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Policies</h1>
        {!readOnly && (
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <FiPlus /> Add Policy
          </button>
        )}
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Version</th>
              <th>Status</th>
              <th>Published Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((policy) => (
              <tr key={policy.id}>
                <td>
                  <div style={{ fontWeight: '600' }}>{policy.title}</div>
                </td>
                <td>{policy.version}</td>
                <td>
                  <span className={policy.is_published ? 'badge badge-success' : 'badge badge-gray'}>
                    {policy.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td>
                  {policy.published_at
                    ? new Date(policy.published_at).toLocaleDateString()
                    : '-'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {!readOnly && (
                      <>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => openEditModal(policy)}
                        >
                          <FiEdit />
                        </button>
                        {!policy.is_published && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handlePublish(policy.id)}
                          >
                            <FiSend /> Publish
                          </button>
                        )}
                        <button
                          className="btn btn-sm"
                          style={{ backgroundColor: 'var(--info)', color: 'white' }}
                          onClick={() => handleViewReport(policy)}
                        >
                          <FiBarChart2 /> Report
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(policy.id)}
                        >
                          <FiTrash2 />
                        </button>
                      </>
                    )}
                    {readOnly && (
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => {
                          setSelectedPolicy(policy);
                          setShowModal(true);
                        }}
                      >
                        <FiEye /> View
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => !readOnly && setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {readOnly ? 'View Policy' : selectedPolicy ? 'Edit Policy' : 'Add Policy'}
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
                <label className="label">Version</label>
                <input
                  type="text"
                  className="input"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  required
                  disabled={readOnly}
                />
              </div>
              <div className="form-group">
                <label className="label">Content (Markdown supported)</label>
                <textarea
                  className="textarea"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  disabled={readOnly}
                  style={{ minHeight: '400px', fontFamily: 'monospace' }}
                />
              </div>
              {!readOnly && (
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {selectedPolicy ? 'Update' : 'Create'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Acknowledgment Report Modal */}
      {showReportModal && report && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Acknowledgment Report</h2>
              <button className="modal-close" onClick={() => setShowReportModal(false)}>
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{report.policy_title}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div className="card" style={{ background: 'var(--gray-100)' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Total Users</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{report.total_users}</div>
                </div>
                <div className="card" style={{ background: 'var(--success)', color: 'white' }}>
                  <div style={{ fontSize: '0.875rem' }}>Acknowledged</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{report.acknowledged_count}</div>
                </div>
                <div className="card" style={{ background: 'var(--warning)', color: 'white' }}>
                  <div style={{ fontSize: '0.875rem' }}>Pending</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{report.pending_count}</div>
                </div>
              </div>
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <div style={{
                  height: '10px',
                  backgroundColor: 'var(--gray-200)',
                  borderRadius: '5px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${report.acknowledgment_rate}%`,
                    backgroundColor: 'var(--success)',
                    transition: 'width 0.3s'
                  }} />
                </div>
                <p style={{ marginTop: '0.5rem', fontWeight: '600' }}>
                  {report.acknowledgment_rate}% Acknowledgment Rate
                </p>
              </div>
            </div>

            {report.pending_users.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
                  Pending Users ({report.pending_users.length})
                </h3>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.pending_users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.full_name}</td>
                          <td>{user.email}</td>
                          <td style={{ textTransform: 'capitalize' }}>
                            {user.role.replace('_', ' ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Policies;
