import { useState, useEffect } from 'react';
import { frameworkAPI, requirementAPI } from '../api';
import { toast } from 'react-toastify';
import { FiPlus, FiEye } from 'react-icons/fi';

function Frameworks() {
  const [frameworks, setFrameworks] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFrameworkModal, setShowFrameworkModal] = useState(false);
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    version: ''
  });

  useEffect(() => {
    loadFrameworks();
  }, []);

  const loadFrameworks = async () => {
    try {
      const res = await frameworkAPI.list();
      setFrameworks(res.data);
    } catch (error) {
      toast.error('Failed to load frameworks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await frameworkAPI.create(formData);
      toast.success('Framework created successfully');
      setShowFrameworkModal(false);
      resetForm();
      loadFrameworks();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleViewRequirements = async (framework) => {
    setSelectedFramework(framework);
    try {
      const res = await requirementAPI.list(framework.id);
      setRequirements(res.data);
      setShowRequirementsModal(true);
    } catch (error) {
      toast.error('Failed to load requirements');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      version: ''
    });
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Compliance Frameworks</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowFrameworkModal(true);
          }}
        >
          <FiPlus /> Add Framework
        </button>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {frameworks.map((framework) => (
          <div key={framework.id} className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {framework.name}
                </h2>
                {framework.version && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
                    Version: {framework.version}
                  </div>
                )}
                <p style={{ color: 'var(--gray-600)' }}>{framework.description}</p>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                  Created: {new Date(framework.created_at).toLocaleDateString()}
                </div>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => handleViewRequirements(framework)}
              >
                <FiEye /> View Requirements
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Framework Modal */}
      {showFrameworkModal && (
        <div className="modal-overlay" onClick={() => setShowFrameworkModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Framework</h2>
              <button className="modal-close" onClick={() => setShowFrameworkModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">Framework Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., SOC 2 Type 2, ISO 27001"
                />
              </div>
              <div className="form-group">
                <label className="label">Version</label>
                <input
                  type="text"
                  className="input"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="e.g., 2017, 2013"
                />
              </div>
              <div className="form-group">
                <label className="label">Description</label>
                <textarea
                  className="textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the framework"
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowFrameworkModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Requirements Modal */}
      {showRequirementsModal && selectedFramework && (
        <div className="modal-overlay" onClick={() => setShowRequirementsModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                Requirements: {selectedFramework.name}
              </h2>
              <button className="modal-close" onClick={() => setShowRequirementsModal(false)}>
                ×
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ color: 'var(--gray-600)' }}>
                Total Requirements: <strong>{requirements.length}</strong>
              </p>
            </div>

            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {requirements.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Title</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requirements.map((req) => (
                      <tr key={req.id}>
                        <td style={{ fontWeight: '600', whiteSpace: 'nowrap' }}>{req.code}</td>
                        <td style={{ fontWeight: '500' }}>{req.title}</td>
                        <td style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                          {req.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-600)' }}>
                  No requirements defined for this framework yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Frameworks;
