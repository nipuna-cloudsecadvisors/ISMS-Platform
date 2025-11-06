import { useState, useEffect } from 'react';
import { reportAPI, frameworkAPI } from '../api';
import { toast } from 'react-toastify';
import { FiDownload, FiFileText } from 'react-icons/fi';

function Reports() {
  const [frameworks, setFrameworks] = useState([]);
  const [selectedFramework, setSelectedFramework] = useState(null);
  const [complianceReport, setComplianceReport] = useState(null);
  const [riskReport, setRiskReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFrameworks();
    loadRiskReport();
  }, []);

  const loadFrameworks = async () => {
    try {
      const res = await frameworkAPI.list();
      setFrameworks(res.data);
    } catch (error) {
      toast.error('Failed to load frameworks');
    }
  };

  const loadComplianceReport = async (frameworkId) => {
    setLoading(true);
    try {
      const res = await reportAPI.compliance(frameworkId);
      setComplianceReport(res.data);
      const framework = frameworks.find(f => f.id === frameworkId);
      setSelectedFramework(framework);
    } catch (error) {
      toast.error('Failed to load compliance report');
    } finally {
      setLoading(false);
    }
  };

  const loadRiskReport = async () => {
    try {
      const res = await reportAPI.riskRegister();
      setRiskReport(res.data);
    } catch (error) {
      toast.error('Failed to load risk report');
    }
  };

  const downloadReport = (type) => {
    let content = '';
    let filename = '';

    if (type === 'compliance' && complianceReport) {
      filename = `compliance-report-${selectedFramework.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
      content = `COMPLIANCE REPORT\n`;
      content += `Framework: ${complianceReport.framework_name}\n`;
      content += `Version: ${complianceReport.framework_version}\n`;
      content += `Report Date: ${new Date(complianceReport.report_date).toLocaleString()}\n`;
      content += `\n${'='.repeat(80)}\n\n`;

      complianceReport.requirements.forEach((req) => {
        content += `Requirement: ${req.requirement_code} - ${req.requirement_title}\n`;
        content += `Description: ${req.requirement_description}\n`;
        content += `Control: ${req.control_title}\n`;
        content += `Status: ${req.control_status}\n`;
        content += `Owner: ${req.control_owner}\n`;
        content += `Evidence Count: ${req.evidence_count}\n`;
        content += `Last Checked: ${req.last_checked || 'Never'}\n`;
        content += `\n${'-'.repeat(80)}\n\n`;
      });
    } else if (type === 'risk' && riskReport) {
      filename = `risk-register-${new Date().toISOString().split('T')[0]}.txt`;
      content = `RISK REGISTER REPORT\n`;
      content += `Generated: ${new Date().toLocaleString()}\n`;
      content += `Total Risks: ${riskReport.total_count}\n`;
      content += `\n${'='.repeat(80)}\n\n`;

      riskReport.risks.forEach((risk) => {
        content += `Title: ${risk.title}\n`;
        content += `Description: ${risk.description}\n`;
        content += `Likelihood: ${risk.likelihood}/5\n`;
        content += `Impact: ${risk.impact}/5\n`;
        content += `Risk Score: ${risk.risk_score}\n`;
        content += `Risk Level: ${risk.risk_level.toUpperCase()}\n`;
        content += `Category: ${risk.category || 'N/A'}\n`;
        content += `Status: ${risk.status}\n`;
        content += `Owner: ${risk.owner}\n`;
        content += `Mitigating Controls: ${risk.mitigating_controls.join(', ') || 'None'}\n`;
        content += `Created: ${new Date(risk.created_at).toLocaleString()}\n`;
        content += `\n${'-'.repeat(80)}\n\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Report downloaded successfully');
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        Reports
      </h1>

      {/* Compliance Report Section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          Compliance Report
        </h2>
        <div className="form-group">
          <label className="label">Select Framework</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <select
              className="select"
              onChange={(e) => {
                const id = parseInt(e.target.value);
                if (id) loadComplianceReport(id);
              }}
              defaultValue=""
            >
              <option value="">Choose a framework...</option>
              {frameworks.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            {complianceReport && (
              <button
                className="btn btn-primary"
                onClick={() => downloadReport('compliance')}
              >
                <FiDownload /> Download
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="loading" style={{ minHeight: '200px' }}>
            <div className="spinner"></div>
          </div>
        )}

        {complianceReport && !loading && (
          <div style={{ marginTop: '2rem' }}>
            <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--gray-50)', borderRadius: '0.375rem' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                {complianceReport.framework_name}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                Version: {complianceReport.framework_version} • Generated: {new Date(complianceReport.report_date).toLocaleString()}
              </p>
            </div>

            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Requirement</th>
                    <th>Control</th>
                    <th>Status</th>
                    <th>Owner</th>
                    <th>Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceReport.requirements.map((req, index) => (
                    <tr key={index}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{req.requirement_code}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                          {req.requirement_title}
                        </div>
                      </td>
                      <td>{req.control_title}</td>
                      <td>
                        <span className={`badge badge-${
                          req.control_status === 'implemented' ? 'success' :
                          req.control_status === 'in_progress' ? 'warning' : 'gray'
                        }`}>
                          {req.control_status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{req.control_owner}</td>
                      <td>{req.evidence_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Risk Register Report */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            Risk Register Report
          </h2>
          {riskReport && (
            <button
              className="btn btn-primary"
              onClick={() => downloadReport('risk')}
            >
              <FiDownload /> Download
            </button>
          )}
        </div>

        {riskReport && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ color: 'var(--gray-600)' }}>
                Total Risks: <strong>{riskReport.total_count}</strong>
              </p>
            </div>

            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>L</th>
                    <th>I</th>
                    <th>Score</th>
                    <th>Level</th>
                    <th>Status</th>
                    <th>Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {riskReport.risks.map((risk) => (
                    <tr key={risk.id}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{risk.title}</div>
                        {risk.category && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                            {risk.category}
                          </div>
                        )}
                      </td>
                      <td>{risk.likelihood}</td>
                      <td>{risk.impact}</td>
                      <td style={{ fontWeight: '600' }}>{risk.risk_score}</td>
                      <td>
                        <span className={`badge badge-${
                          risk.risk_level === 'critical' || risk.risk_level === 'high' ? 'danger' :
                          risk.risk_level === 'medium' ? 'warning' : 'success'
                        }`}>
                          {risk.risk_level}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-info">
                          {risk.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{risk.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Reports;
