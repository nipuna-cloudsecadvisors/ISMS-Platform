import { useState, useEffect } from 'react';
import { policyAckAPI, policyAPI } from '../api';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiFileText } from 'react-icons/fi';

function PolicyView() {
  const [pendingPolicies, setPendingPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingPolicies();
  }, []);

  const loadPendingPolicies = async () => {
    try {
      const res = await policyAckAPI.getPending();
      setPendingPolicies(res.data);
    } catch (error) {
      toast.error('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (policyId) => {
    try {
      await policyAckAPI.acknowledge(policyId);
      toast.success('Policy acknowledged successfully');
      setSelectedPolicy(null);
      loadPendingPolicies();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to acknowledge policy');
    }
  };

  const viewPolicy = async (policy) => {
    setSelectedPolicy(policy);
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        My Policies
      </h1>

      {pendingPolicies.length === 0 ? (
        <div className="card">
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <FiCheckCircle size={64} color="var(--success)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>All Caught Up!</h2>
            <p style={{ color: 'var(--gray-600)' }}>
              You have acknowledged all published policies.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="alert alert-info" style={{ marginBottom: '2rem' }}>
            You have {pendingPolicies.length} policy/policies that require your acknowledgment.
            Please review and acknowledge each policy.
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {pendingPolicies.map((policy) => (
              <div key={policy.id} className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <FiFileText size={20} color="var(--primary)" />
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{policy.title}</h3>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      Version: {policy.version}
                      {policy.published_at && (
                        <> • Published: {new Date(policy.published_at).toLocaleDateString()}</>
                      )}
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => viewPolicy(policy)}
                  >
                    Review & Acknowledge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Policy Review Modal */}
      {selectedPolicy && (
        <div className="modal-overlay" onClick={() => setSelectedPolicy(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedPolicy.title}</h2>
              <button className="modal-close" onClick={() => setSelectedPolicy(null)}>
                ×
              </button>
            </div>

            <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--gray-50)', borderRadius: '0.375rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                Version: {selectedPolicy.version} • Published: {new Date(selectedPolicy.published_at).toLocaleDateString()}
              </div>
            </div>

            <div style={{
              maxHeight: '500px',
              overflowY: 'auto',
              padding: '1rem',
              border: '1px solid var(--gray-200)',
              borderRadius: '0.375rem',
              marginBottom: '1.5rem',
              backgroundColor: 'white'
            }}>
              <pre style={{
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                margin: 0
              }}>
                {selectedPolicy.content}
              </pre>
            </div>

            <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
              <strong>Important:</strong> By acknowledging this policy, you confirm that you have read, understood, 
              and agree to comply with all provisions outlined in this document.
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedPolicy(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleAcknowledge(selectedPolicy.id)}
              >
                <FiCheckCircle /> I Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PolicyView;
