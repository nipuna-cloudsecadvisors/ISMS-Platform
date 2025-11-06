import { useState, useEffect } from 'react';
import { controlAPI, evidenceAPI, requirementAPI, userAPI } from '../api';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit, FiTrash2, FiUpload, FiEye } from 'react-icons/fi';

function Controls({ user, readOnly }) {
  const [controls, setControls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [selectedControl, setSelectedControl] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'not_started',
    owner_id: '',
    implementation_details: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [controlsRes, usersRes] = await Promise.all([
        controlAPI.list(),
        userAPI.list().catch(() => ({ data: [] }))
      ]);
      setControls(controlsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      toast.error('Failed to load controls');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedControl) {
        await controlAPI.update(selectedControl.id, formData);
        toast.success('Control updated successfully');
      } else {
        await controlAPI.create(formData);
        toast.success('Control created successfully');
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this control?')) {
      try {
        await controlAPI.delete(id);
        toast.success('Control deleted');
        loadData();
      } catch (error) {
        toast.error('Failed to delete control');
      }
    }
  };

  const handleViewEvidence = async (control) => {
    setSelectedControl(control);
    try {
      const res = await evidenceAPI.list(control.id);
      setEvidenceList(res.data);
      setShowEvidenceModal(true);
    } catch (error) {
      toast.error('Failed to load evidence');
    }
  };

  const handleUploadEvidence = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    formData.append('control_id', selectedControl.id);

    try {
      await evidenceAPI.create(formData);
      toast.success('Evidence uploaded');
      const res = await evidenceAPI.list(selectedControl.id);
      setEvidenceList(res.data);
      form.reset();
    } catch (error) {
      toast.error('Failed to upload evidence');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'not_started',
      owner_id: '',
      implementation_details: ''
    });
    setSelectedControl(null);
  };

  const openEditModal = (control) => {
    setSelectedControl(control);
    setFormData({
      title: control.title,
      description: control.description || '',
      status: control.status,
      owner_id: control.owner_id || '',
      implementation_details: control.implementation_details || ''
    });
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      implemented: 'badge-success',
      in_progress: 'badge-warning',
      not_started: 'badge-gray',
      failed: 'badge-danger'
    };
    return `badge ${badges[status] || 'badge-gray'}`;
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Controls</h1>
        {!readOnly && (
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <FiPlus /> Add Control
          </button>
        )}
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Owner</th>
              <th>Evidence</th>
              <th>Last Checked</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {controls.map((control) => {
              const owner = users.find(u => u.id === control.owner_id);
              return (
                <tr key={control.id}>
                  <td>
                    <div style={{ fontWeight: '600' }}>{control.title}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      {control.description}
                    </div>
                  </td>
                  <td>
                    <span className={getStatusBadge(control.status)}>
                      {control.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{owner?.full_name || 'Unassigned'}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleViewEvidence(control)}
                    >
                      <FiEye /> View
                    </button>
                  </td>
                  <td>
                    {control.last_checked
                      ? new Date(control.last_checked).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {!readOnly && (
                        <>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => openEditModal(control)}
                          >
                            <FiEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(control.id)}
                          >
                            <FiTrash2 />
                          </button>
                        </>
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
                {selectedControl ? 'Edit Control' : 'Add Control'}
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
                />
              </div>
              <div className="form-group">
                <label className="label">Description</label>
                <textarea
                  className="textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="label">Status</label>
                <select
                  className="select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="implemented">Implemented</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">Owner</label>
                <select
                  className="select"
                  value={formData.owner_id}
                  onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Implementation Details</label>
                <textarea
                  className="textarea"
                  value={formData.implementation_details}
                  onChange={(e) => setFormData({ ...formData, implementation_details: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {selectedControl ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evidence Modal */}
      {showEvidenceModal && selectedControl && (
        <div className="modal-overlay" onClick={() => setShowEvidenceModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Evidence: {selectedControl.title}</h2>
              <button className="modal-close" onClick={() => setShowEvidenceModal(false)}>
                ×
              </button>
            </div>
            
            {!readOnly && (
              <form onSubmit={handleUploadEvidence} style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'var(--gray-50)', borderRadius: '0.375rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Upload New Evidence</h3>
                <div className="form-group">
                  <label className="label">Title</label>
                  <input type="text" name="title" className="input" required />
                </div>
                <div className="form-group">
                  <label className="label">Description</label>
                  <textarea name="description" className="textarea" />
                </div>
                <div className="form-group">
                  <label className="label">File (optional)</label>
                  <input type="file" name="file" className="input" />
                </div>
                <button type="submit" className="btn btn-primary">
                  <FiUpload /> Upload Evidence
                </button>
              </form>
            )}

            <h3 style={{ marginBottom: '1rem' }}>Existing Evidence ({evidenceList.length})</h3>
            {evidenceList.length > 0 ? (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {evidenceList.map((evidence) => (
                  <div key={evidence.id} className="card" style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{evidence.title}</div>
                    {evidence.description && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
                        {evidence.description}
                      </p>
                    )}
                    {evidence.file_name && (
                      <div style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>
                        📎 {evidence.file_name}
                      </div>
                    )}
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                      Uploaded {new Date(evidence.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--gray-600)' }}>No evidence uploaded yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Controls;
