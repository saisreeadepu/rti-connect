import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rtiAPI } from '../utils/api';
import { 
  FaSearch, 
  FaFileAlt, 
  FaClock, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaBuilding,
  FaCalendarAlt,
  FaArrowLeft,
  FaDownload,
  FaFilePdf,
  FaFileImage,
  FaFileWord
} from 'react-icons/fa';
import Loader from '../components/Loader';
import './TrackRequest.css';
import toast from 'react-hot-toast';

const TrackRequest = () => {
  const { requestId: urlRequestId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState(null);
  const [searchId, setSearchId] = useState(urlRequestId || '');
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchId.trim()) {
      toast.error('Please enter a Request ID');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await rtiAPI.trackRequest(searchId.trim());
      setRequest(response.data);
      // Update URL with request ID
      navigate(`/track/${searchId.trim()}`, { replace: true });
    } catch (error) {
      console.error('Error tracking request:', error);
      setError('Request not found. Please check the Request ID and try again.');
      setRequest(null);
      toast.error('Request not found');
    } finally {
      setLoading(false);
    }
  };

  const handleNewSearch = () => {
    setRequest(null);
    setSearchId('');
    setError('');
    navigate('/track', { replace: true });
  };

  const handleDownloadPdf = async () => {
    try {
      toast.loading('Generating PDF...', { id: 'pdf-download' });
      const response = await rtiAPI.downloadPdf(request.requestId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `RTI_${request.requestId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF downloaded successfully', { id: 'pdf-download' });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF', { id: 'pdf-download' });
    }
  };

  const getStatusConfig = (status) => {
    const config = {
      'submitted': { 
        icon: <FaClock />, 
        class: 'status-submitted', 
        label: 'Submitted',
        description: 'Your application has been submitted successfully.'
      },
      'fee-pending': { 
        icon: <FaClock />, 
        class: 'status-fee-pending', 
        label: 'Fee Pending',
        description: 'Payment of ₹10 is pending. Please complete the payment to proceed.'
      },
      'fee-paid': { 
        icon: <FaCheckCircle />, 
        class: 'status-fee-paid', 
        label: 'Fee Paid',
        description: 'Payment received. Your application is being processed.'
      },
      'under-review': { 
        icon: <FaClock />, 
        class: 'status-under-review', 
        label: 'Under Review',
        description: 'Your application is currently under review by the PIO.'
      },
      'forwarded': { 
        icon: <FaClock />, 
        class: 'status-forwarded', 
        label: 'Forwarded',
        description: 'Your application has been forwarded to another department.'
      },
      'replied': { 
        icon: <FaCheckCircle />, 
        class: 'status-replied', 
        label: 'Replied',
        description: 'Response has been provided for your application.'
      },
      'rejected': { 
        icon: <FaExclamationTriangle />, 
        class: 'status-rejected', 
        label: 'Rejected',
        description: 'Your application has been rejected. Check the response for details.'
      },
      'appealed': { 
        icon: <FaExclamationTriangle />, 
        class: 'status-appealed', 
        label: 'Appealed',
        description: 'An appeal has been filed against the response.'
      },
      'closed': { 
        icon: <FaCheckCircle />, 
        class: 'status-closed', 
        label: 'Closed',
        description: 'This application has been closed.'
      }
    };
    return config[status] || config.submitted;
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.includes('pdf')) return <FaFilePdf />;
    if (mimeType?.includes('image')) return <FaFileImage />;
    if (mimeType?.includes('word')) return <FaFileWord />;
    return <FaFileAlt />;
  };

  const calculateDaysLeft = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="track-request-page">
      <div className="container">
        <div className="track-header">
          <h1 className="track-title">
            <FaSearch /> Track Your RTI Application
          </h1>
          <p className="track-subtitle">
            Enter your RTI Request ID to check the current status
          </p>
        </div>

        {!request ? (
          /* Search Form */
          <div className="search-section">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-group">
                <input
                  type="text"
                  className="form-control search-input"
                  placeholder="Enter Request ID (e.g., RTI123ABC)"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                  disabled={loading}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary search-button"
                  disabled={loading}
                >
                  {loading ? <Loader size="small" /> : <><FaSearch /> Track</>}
                </button>
              </div>
              {error && <div className="error-message">{error}</div>}
            </form>

            <div className="search-info">
              <h3>How to find your Request ID?</h3>
              <ul>
                <li>Check your email confirmation after submitting RTI</li>
                <li>Find it in your dashboard under "My Requests"</li>
                <li>The ID format is like: RTI123ABC456</li>
              </ul>
            </div>
          </div>
        ) : (
          /* Request Details */
          <div className="track-result">
            <button onClick={handleNewSearch} className="btn btn-outline new-search-btn">
              <FaArrowLeft /> Track Another Request
            </button>

            {/* Status Header */}
            <div className="status-header">
              <div className="request-id-large">
                #{request.requestId}
              </div>
              {(() => {
                const status = getStatusConfig(request.status);
                return (
                  <div className={`status-badge-large ${status.class}`}>
                    {status.icon} {status.label}
                  </div>
                );
              })()}
            </div>

            <div className="track-grid">
              {/* Main Info */}
              <div className="info-card main-info">
                <h3>Application Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <FaBuilding className="info-icon" />
                    <div>
                      <label>Department</label>
                      <p>{request.department}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <FaCalendarAlt className="info-icon" />
                    <div>
                      <label>Filed On</label>
                      <p>{new Date(request.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <FaClock className="info-icon" />
                    <div>
                      <label>Deadline</label>
                      <p className={new Date(request.deadline) < new Date() ? 'text-danger' : ''}>
                        {new Date(request.deadline).toLocaleDateString()}
                        {!new Date(request.deadline) < new Date() && (
                          <span className="days-left">
                            ({calculateDaysLeft(request.deadline)} days left)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="subject-box">
                  <label>Subject</label>
                  <p>{request.subject}</p>
                </div>

                <div className="description-box">
                  <label>Description</label>
                  <p>{request.description}</p>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="info-card timeline-card">
                <h3>Application Timeline</h3>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <span className="timeline-status">Application Submitted</span>
                      <span className="timeline-date">
                        {new Date(request.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {request.feeDetails?.paidAt && (
                    <div className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <span className="timeline-status">Fee Paid</span>
                        <span className="timeline-date">
                          {new Date(request.feeDetails.paidAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {request.response?.respondedAt && (
                    <div className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <span className="timeline-status">Response Received</span>
                        <span className="timeline-date">
                          {new Date(request.response.respondedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {request.appeal?.filedAt && (
                    <div className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <span className="timeline-status">Appeal Filed</span>
                        <span className="timeline-date">
                          {new Date(request.appeal.filedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {request.timeline?.map((entry, index) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <span className="timeline-status">{entry.status}</span>
                        {entry.remark && (
                          <span className="timeline-remark">{entry.remark}</span>
                        )}
                        <span className="timeline-date">
                          {new Date(entry.updatedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Response Section */}
              {request.response && (
                <div className="info-card response-card">
                  <h3>
                    <FaCheckCircle /> Response from Department
                  </h3>
                  <div className="response-content">
                    <p>{request.response.text}</p>
                    
                    {request.response.documents?.length > 0 && (
                      <div className="response-documents">
                        <h4>Attached Documents:</h4>
                        {request.response.documents.map((doc, index) => (
                          <a
                            key={index}
                            href={`http://localhost:5000/${doc.path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="document-link"
                          >
                            {getFileIcon(doc.mimeType)}
                            <span>{doc.originalName}</span>
                            <FaDownload className="download-icon" />
                          </a>
                        ))}
                      </div>
                    )}
                    
                    <div className="response-meta">
                      Responded on: {new Date(request.response.respondedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}

              {/* Appeal Information */}
              {request.appeal?.filed && (
                <div className="info-card appeal-card">
                  <h3>
                    <FaExclamationTriangle /> Appeal Status
                  </h3>
                  <div className="appeal-content">
                    <p><strong>Reason:</strong> {request.appeal.reason}</p>
                    <p><strong>Filed on:</strong> {new Date(request.appeal.filedAt).toLocaleDateString()}</p>
                    {request.appeal.decision && (
                      <>
                        <p><strong>Decision:</strong> 
                          <span className={`appeal-decision ${request.appeal.decision}`}>
                            {request.appeal.decision.toUpperCase()}
                          </span>
                        </p>
                        {request.appeal.decisionRemarks && (
                          <p><strong>Remarks:</strong> {request.appeal.decisionRemarks}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="info-card actions-card">
                <h3>Need Help?</h3>
                <div className="action-buttons">
                  <button 
                    className="btn btn-outline-primary btn-block"
                    onClick={() => window.print()}
                  >
                    Print Status
                  </button>
                  <button 
                    className="btn btn-primary btn-block"
                    onClick={handleDownloadPdf}
                  >
                    <FaDownload /> Download Application PDF
                  </button>
                  <a 
                    href={`mailto:support@rticonnect.gov.in?subject=Query regarding RTI ${request.requestId}`}
                    className="btn btn-outline btn-block"
                  >
                    Contact Support
                  </a>
                  {request.status === 'replied' && !request.appeal?.filed && (
                    <button 
                      className="btn btn-warning btn-block"
                      onClick={() => navigate(`/appeal/file/${request.requestId}`)}
                    >
                      File Appeal
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackRequest;