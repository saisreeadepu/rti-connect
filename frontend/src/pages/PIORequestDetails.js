import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pioAPI, departmentsAPI } from '../utils/api';
import { 
  FaArrowLeft, 
  FaDownload, 
  FaFilePdf, 
  FaFileImage, 
  FaFileWord,
  FaPaperPlane,
  FaRedoAlt,
  FaUser,
  FaBuilding,
  FaClock,
  FaExclamationTriangle,
  FaUpload
} from 'react-icons/fa';
import Loader from '../components/Loader';
import './PIORequestDetails.css';
import toast from 'react-hot-toast';

const PIORequestDetails = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [request, setRequest] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [response, setResponse] = useState({
    text: '',
    documents: []
  });
  const [showForwardForm, setShowForwardForm] = useState(false);
  const [forwardData, setForwardData] = useState({
    department: '',
    reason: '',
    remarks: ''
  });

  useEffect(() => {
    fetchRequestDetails();
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const response = await pioAPI.getRequest(requestId);
      setRequest(response.data);
    } catch (error) {
      console.error('Error fetching request:', error);
      toast.error('Failed to load request details');
      navigate('/pio-requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentsAPI.getAll();
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setResponse(prev => ({
      ...prev,
      documents: [...prev.documents, ...files]
    }));
  };

  const removeFile = (index) => {
    setResponse(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!response.text.trim()) {
      toast.error('Please enter your response');
      return;
    }

    try {
      setSubmitting(true);
      await pioAPI.respond(requestId, response);
      toast.success('Response submitted successfully');
      fetchRequestDetails();
      setResponse({ text: '', documents: [] });
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForward = async (e) => {
    e.preventDefault();
    if (!forwardData.department || !forwardData.reason) {
      toast.error('Please select department and provide reason');
      return;
    }

    try {
      setSubmitting(true);
      await pioAPI.forward(requestId, forwardData);
      toast.success('Request forwarded successfully');
      setShowForwardForm(false);
      fetchRequestDetails();
    } catch (error) {
      console.error('Error forwarding request:', error);
      toast.error('Failed to forward request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      await pioAPI.updateStatus(requestId, { status, remark: `Status updated to ${status}` });
      toast.success(`Status updated to ${status}`);
      fetchRequestDetails();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.includes('pdf')) return <FaFilePdf />;
    if (mimeType?.includes('image')) return <FaFileImage />;
    if (mimeType?.includes('word')) return <FaFileWord />;
    return <FaFileWord />;
  };

  const getDaysLeft = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!request) {
    return null;
  }

  const daysLeft = getDaysLeft(request.deadline);
  const isOverdue = daysLeft < 0;

  return (
    <div className="pio-request-details-page">
      <div className="container">
        <div className="navigation">
          <button onClick={() => navigate('/pio-requests')} className="btn btn-outline">
            <FaArrowLeft /> Back to Requests
          </button>
        </div>

        <div className="request-header">
          <div>
            <h1 className="request-title">RTI Request #{request.requestId}</h1>
            <p className="request-subtitle">
              Filed on {new Date(request.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className={`deadline-badge ${isOverdue ? 'overdue' : ''}`}>
            {isOverdue ? (
              <>
                <FaExclamationTriangle /> {Math.abs(daysLeft)} days overdue
              </>
            ) : (
              <>
                <FaClock /> {daysLeft} days left
              </>
            )}
          </div>
        </div>

        <div className="details-grid">
          <div className="request-info-section">
            <div className="info-card">
              <h3><FaUser /> Citizen Information</h3>
              <div className="citizen-details">
                <div className="detail-row">
                  <label>Name</label>
                  <p>{request.citizen?.name || 'N/A'}</p>
                </div>
                <div className="detail-row">
                  <label>Email</label>
                  <p>{request.citizen?.email || 'N/A'}</p>
                </div>
                <div className="detail-row">
                  <label>Phone</label>
                  <p>{request.citizen?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3><FaBuilding /> Request Details</h3>
              <div className="request-details">
                <div className="detail-row">
                  <label>Department</label>
                  <p>{request.department}</p>
                </div>
                <div className="detail-row">
                  <label>Subject</label>
                  <p className="subject-text">{request.subject}</p>
                </div>
                <div className="detail-row">
                  <label>Description</label>
                  <p className="description-text">{request.description}</p>
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3>Questions</h3>
              <div className="questions-list">
                {request.questions?.map((q, index) => (
                  <div key={index} className="question-item">
                    <div className="question-number">Q{index + 1}</div>
                    <div className="question-text">{q.question}</div>
                  </div>
                ))}
              </div>
            </div>

            {request.documents?.length > 0 && (
              <div className="info-card">
                <h3>Attached Documents</h3>
                <div className="documents-list">
                  {request.documents.map((doc, index) => (
                    <a
                      key={index}
                      href={`http://localhost:5000/${doc.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="document-item"
                    >
                      {getFileIcon(doc.mimeType)}
                      <span className="document-name">{doc.originalName}</span>
                      <FaDownload className="download-icon" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="actions-section">
            <div className="actions-card">
              <h3>Request Status</h3>
              <div className="status-display">
                <span className={`status-badge status-${request.status}`}>
                  {request.status?.replace('-', ' ').toUpperCase()}
                </span>
              </div>
              
              <div className="status-actions">
                <h4>Update Status</h4>
                <div className="status-buttons">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => handleUpdateStatus('under-review')}
                    disabled={request.status === 'under-review'}
                  >
                    Mark Under Review
                  </button>
                  <button
                    className="btn btn-outline-success btn-sm"
                    onClick={() => handleUpdateStatus('replied')}
                    disabled={request.status === 'replied'}
                  >
                    Mark Replied
                  </button>
                </div>
              </div>
            </div>

            {request.status !== 'replied' && request.status !== 'rejected' && (
              <div className="actions-card">
                <h3><FaPaperPlane /> Submit Response</h3>
                <form onSubmit={handleSubmitResponse}>
                  <div className="form-group">
                    <label>Response Text *</label>
                    <textarea
                      className="form-control"
                      rows="6"
                      value={response.text}
                      onChange={(e) => setResponse(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Enter your response to the RTI request..."
                      required
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label>Attach Documents (Optional)</label>
                    <div className="file-upload-area">
                      <input
                        type="file"
                        id="response-files"
                        multiple
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        className="file-input"
                      />
                      <label htmlFor="response-files" className="file-upload-label">
                        <FaUpload /> Choose Files
                      </label>
                    </div>
                    
                    {response.documents.length > 0 && (
                      <div className="selected-files">
                        {response.documents.map((file, index) => (
                          <div key={index} className="selected-file">
                            <span>{file.name}</span>
                            <button
                              type="button"
                              className="remove-file"
                              onClick={() => removeFile(index)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={submitting}
                  >
                    {submitting ? <Loader size="small" /> : 'Submit Response'}
                  </button>
                </form>
              </div>
            )}

            {!showForwardForm ? (
              <button
                className="btn btn-outline-warning btn-block"
                onClick={() => setShowForwardForm(true)}
              >
                <FaRedoAlt /> Forward to Another Department
              </button>
            ) : (
              <div className="actions-card">
                <h3>Forward Request</h3>
                <form onSubmit={handleForward}>
                  <div className="form-group">
                    <label>Select Department *</label>
                    <select
                      className="form-control"
                      value={forwardData.department}
                      onChange={(e) => setForwardData(prev => ({ ...prev, department: e.target.value }))}
                      required
                    >
                      <option value="">Choose department...</option>
                      {departments
                        ?.filter(d => d.name !== request.department)
                        .map(dept => (
                          <option key={dept._id} value={dept.name}>{dept.name}</option>
                        ))
                      }
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Reason for Forwarding *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={forwardData.reason}
                      onChange={(e) => setForwardData(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="e.g., Not under my jurisdiction"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Additional Remarks</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={forwardData.remarks}
                      onChange={(e) => setForwardData(prev => ({ ...prev, remarks: e.target.value }))}
                      placeholder="Any additional comments..."
                    ></textarea>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setShowForwardForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-warning"
                      disabled={submitting}
                    >
                      {submitting ? <Loader size="small" /> : 'Forward Request'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PIORequestDetails;