import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appealsAPI } from '../utils/api';
import { 
  FaArrowLeft, 
  FaGavel, 
  FaUser, 
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFileAlt,
  FaDownload
} from 'react-icons/fa';
import Loader from '../components/Loader';
import './AppealDetails.css';
import toast from 'react-hot-toast';

const AppealDetails = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [appeal, setAppeal] = useState(null);
  const [decision, setDecision] = useState({
    decision: '',
    remarks: ''
  });

  useEffect(() => {
    fetchAppealDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  const fetchAppealDetails = async () => {
    try {
      setLoading(true);
      const response = await appealsAPI.getAppeal(requestId);
      setAppeal(response.data);
    } catch (error) {
      console.error('Error fetching appeal:', error);
      toast.error('Failed to load appeal details');
      navigate('/appeal-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!decision.decision) {
      toast.error('Please select a decision');
      return;
    }
    if (!decision.remarks.trim()) {
      toast.error('Please provide remarks for your decision');
      return;
    }

    try {
      setSubmitting(true);
      await appealsAPI.decide(requestId, decision);
      toast.success('Decision submitted successfully');
      fetchAppealDetails();
    } catch (error) {
      console.error('Error submitting decision:', error);
      toast.error('Failed to submit decision');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { class: 'badge-warning', label: 'Pending' },
      'accepted': { class: 'badge-success', label: 'Accepted' },
      'rejected': { class: 'badge-danger', label: 'Rejected' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`badge ${config.class}`}>{config.label}</span>;
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!appeal) {
    return null;
  }

  const isDecided = appeal.appeal?.decision !== 'pending';

  return (
    <div className="appeal-details-page">
      <div className="container">
        {/* Navigation */}
        <div className="navigation">
          <button onClick={() => navigate('/appeal-dashboard')} className="btn btn-outline">
            <FaArrowLeft /> Back to Dashboard
          </button>
        </div>

        {/* Header */}
        <div className="appeal-header">
          <div>
            <h1 className="appeal-title">Appeal for #{appeal.requestId}</h1>
            <p className="appeal-subtitle">
              Filed on {new Date(appeal.appeal?.filedAt).toLocaleDateString()}
            </p>
          </div>
          {getStatusBadge(appeal.appeal?.decision)}
        </div>

        {/* Main Content Grid */}
        <div className="details-grid">
          {/* Left Column - Appeal Details */}
          <div className="appeal-info-section">
            {/* Citizen Information */}
            <div className="info-card">
              <h3>
                <FaUser /> Citizen Information
              </h3>
              <div className="citizen-details">
                <div className="detail-row">
                  <label>Name</label>
                  <p>{appeal.citizen?.name || 'N/A'}</p>
                </div>
                <div className="detail-row">
                  <label>Email</label>
                  <p>{appeal.citizen?.email || 'N/A'}</p>
                </div>
                <div className="detail-row">
                  <label>Phone</label>
                  <p>{appeal.citizen?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Original RTI Request */}
            <div className="info-card">
              <h3>
                <FaFileAlt /> Original RTI Request
              </h3>
              <div className="request-details">
                <div className="detail-row">
                  <label>Department</label>
                  <p>{appeal.department}</p>
                </div>
                <div className="detail-row">
                  <label>Subject</label>
                  <p className="subject-text">{appeal.subject}</p>
                </div>
                <div className="detail-row">
                  <label>Description</label>
                  <p className="description-text">{appeal.description}</p>
                </div>
              </div>

              <h4>Questions</h4>
              <div className="questions-list">
                {appeal.questions?.map((q, index) => (
                  <div key={index} className="question-item">
                    <div className="question-number">Q{index + 1}</div>
                    <div className="question-content">
                      <p className="question-text">{q.question}</p>
                      {q.answer && (
                        <div className="answer-box">
                          <strong>Response:</strong> {q.answer}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PIO Response */}
            {appeal.response && (
              <div className="info-card response-card">
                <h3>PIO Response</h3>
                <div className="response-content">
                  <p>{appeal.response.text}</p>
                  {appeal.response.documents?.length > 0 && (
                    <div className="response-documents">
                      <h4>Response Documents:</h4>
                      {appeal.response.documents.map((doc, index) => (
                        <a
                          key={index}
                          href={`http://localhost:5000/${doc.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="document-item"
                        >
                          <FaFileAlt />
                          <span>{doc.originalName}</span>
                          <FaDownload />
                        </a>
                      ))}
                    </div>
                  )}
                  <div className="response-meta">
                    Responded on: {new Date(appeal.response.respondedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Appeal Decision */}
          <div className="decision-section">
            {/* Appeal Details Card */}
            <div className="info-card appeal-card">
              <h3>
                <FaGavel /> Appeal Details
              </h3>
              <div className="appeal-details">
                <div className="detail-row">
                  <label>Reason for Appeal</label>
                  <p className="appeal-reason">{appeal.appeal?.reason}</p>
                </div>
                <div className="detail-row">
                  <label>Filed On</label>
                  <p>{new Date(appeal.appeal?.filedAt).toLocaleDateString()}</p>
                </div>
                {appeal.appeal?.appellateAuthority && (
                  <div className="detail-row">
                    <label>Assigned To</label>
                    <p>{appeal.appeal.appellateAuthority.name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Decision Form - Only show if not already decided */}
            {!isDecided ? (
              <div className="info-card decision-card">
                <h3>Make Decision</h3>
                <form onSubmit={handleDecisionSubmit}>
                  <div className="form-group">
                    <label>Your Decision *</label>
                    <div className="decision-options">
                      <label className="decision-option">
                        <input
                          type="radio"
                          name="decision"
                          value="accepted"
                          checked={decision.decision === 'accepted'}
                          onChange={(e) => setDecision(prev => ({ ...prev, decision: e.target.value }))}
                        />
                        <span className="decision-label accept">Accept Appeal</span>
                      </label>
                      <label className="decision-option">
                        <input
                          type="radio"
                          name="decision"
                          value="rejected"
                          checked={decision.decision === 'rejected'}
                          onChange={(e) => setDecision(prev => ({ ...prev, decision: e.target.value }))}
                        />
                        <span className="decision-label reject">Reject Appeal</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Remarks *</label>
                    <textarea
                      className="form-control"
                      rows="5"
                      value={decision.remarks}
                      onChange={(e) => setDecision(prev => ({ ...prev, remarks: e.target.value }))}
                      placeholder="Provide detailed reasoning for your decision..."
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={submitting}
                  >
                    {submitting ? <Loader size="small" /> : 'Submit Decision'}
                  </button>
                </form>
              </div>
            ) : (
              /* Show Decision Results */
              <div className={`info-card decision-result ${appeal.appeal.decision}`}>
                <h3>Decision Made</h3>
                <div className="decision-badge">
                  {appeal.appeal.decision === 'accepted' ? (
                    <>
                      <FaCheckCircle /> ACCEPTED
                    </>
                  ) : (
                    <>
                      <FaExclamationTriangle /> REJECTED
                    </>
                  )}
                </div>
                <div className="decision-details">
                  <div className="detail-row">
                    <label>Decision Date</label>
                    <p>{new Date(appeal.appeal.decidedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="detail-row">
                    <label>Remarks</label>
                    <p className="decision-remarks">{appeal.appeal.decisionRemarks}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="info-card">
              <h3>
                <FaClock /> Timeline
              </h3>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <span className="timeline-status">RTI Filed</span>
                    <span className="timeline-date">
                      {new Date(appeal.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {appeal.response && (
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <span className="timeline-status">PIO Responded</span>
                      <span className="timeline-date">
                        {new Date(appeal.response.respondedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <span className="timeline-status">Appeal Filed</span>
                    <span className="timeline-date">
                      {new Date(appeal.appeal.filedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {appeal.appeal.decidedAt && (
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <span className="timeline-status">Appeal Decided</span>
                      <span className="timeline-date">
                        {new Date(appeal.appeal.decidedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppealDetails;