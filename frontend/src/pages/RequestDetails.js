import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rtiAPI, appealsAPI, paymentAPI } from '../utils/api';
import { 
  FaArrowLeft, 
  FaDownload, 
  FaFilePdf, 
  FaFileImage, 
  FaFileWord,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBuilding,
  FaUser,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaGavel,
  FaPaperPlane
} from 'react-icons/fa';
import Loader from '../components/Loader';
import './RequestDetails.css';
import toast from 'react-hot-toast';

const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const RequestDetails = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const [showAppealForm, setShowAppealForm] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [submittingAppeal, setSubmittingAppeal] = useState(false);

  useEffect(() => {
    fetchRequestDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const response = await rtiAPI.getRequest(requestId);
      setRequest(response.data);
    } catch (error) {
      console.error('Error fetching request details:', error);
      toast.error('Failed to load request details');
      navigate('/my-requests');
    } finally {
      setLoading(false);
    }
  };

  const handlePayFee = async () => {
    try {
      setLoading(true);

      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        return;
      }

      const orderResponse = await paymentAPI.createOrder({ amount: 10, requestId });
      const { order } = orderResponse.data;

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_mockkey',
        amount: order.amount,
        currency: order.currency,
        name: 'RTI Connect',
        description: `RTI Fee for #` + requestId,
        order_id: order.id,
        handler: async function (response) {
          try {
            await paymentAPI.verify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              requestId
            });
            toast.success('Fee paid successfully!');
            fetchRequestDetails();
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone
        },
        theme: {
          color: '#0056b3'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error('Error paying fee:', error);
      toast.error('Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const handleFileAppeal = async (e) => {
    e.preventDefault();
    if (!appealReason.trim()) {
      toast.error('Please provide a reason for appeal');
      return;
    }

    try {
      setSubmittingAppeal(true);
      await appealsAPI.fileAppeal(requestId, { reason: appealReason });
      toast.success('Appeal filed successfully!');
      setShowAppealForm(false);
      fetchRequestDetails();
    } catch (error) {
      console.error('Error filing appeal:', error);
      toast.error(error.response?.data?.message || 'Failed to file appeal');
    } finally {
      setSubmittingAppeal(false);
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.includes('pdf')) return <FaFilePdf />;
    if (mimeType.includes('image')) return <FaFileImage />;
    if (mimeType.includes('word')) return <FaFileWord />;
    return <FaFileWord />;
  };

  const getStatusConfig = (status) => {
    const config = {
      'submitted': { icon: <FaClock />, class: 'status-submitted', label: 'Submitted' },
      'fee-pending': { icon: <FaClock />, class: 'status-fee-pending', label: 'Fee Pending' },
      'fee-paid': { icon: <FaCheckCircle />, class: 'status-fee-paid', label: 'Fee Paid' },
      'under-review': { icon: <FaClock />, class: 'status-under-review', label: 'Under Review' },
      'forwarded': { icon: <FaClock />, class: 'status-forwarded', label: 'Forwarded' },
      'replied': { icon: <FaCheckCircle />, class: 'status-replied', label: 'Replied' },
      'rejected': { icon: <FaExclamationTriangle />, class: 'status-rejected', label: 'Rejected' },
      'appealed': { icon: <FaGavel />, class: 'status-appealed', label: 'Appealed' },
      'closed': { icon: <FaCheckCircle />, class: 'status-closed', label: 'Closed' }
    };
    return config[status] || config.submitted;
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!request) {
    return null;
  }

  const statusConfig = getStatusConfig(request.status);
  
  const isPending = ['submitted', 'fee-pending', 'fee-paid', 'under-review', 'forwarded'].includes(request.status);
  const createdDate = new Date(request.createdAt);
  const deadlineDate = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  const isOverdue = isPending && deadlineDate < new Date();
  
  const canFileAppeal = (['replied', 'rejected'].includes(request.status) || isOverdue) && !request.appeal?.filed;
  const canPayFee = request.status === 'fee-pending';

  return (
    <div className="request-details-page">
      <div className="container">
        {/* Navigation */}
        <div className="navigation">
          <button onClick={() => navigate(-1)} className="btn btn-outline">
            <FaArrowLeft /> Back
          </button>
        </div>

        {/* Header */}
        <div className="request-header">
          <div>
            <h1 className="request-title">RTI Request #{request.requestId}</h1>
            <p className="request-subtitle">Filed on {new Date(request.createdAt).toLocaleDateString()}</p>
          </div>
          <div className={`status-badge ${statusConfig.class}`}>
            {statusConfig.icon} {statusConfig.label}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="details-grid">
          {/* Left Column - Main Info */}
          <div className="main-info">
            {/* Basic Information */}
            <div className="info-section">
              <h3>Basic Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <FaBuilding className="info-icon" />
                  <div>
                    <label>Department</label>
                    <p>{request.department}</p>
                  </div>
                </div>
                <div className="info-item">
                  <FaUser className="info-icon" />
                  <div>
                    <label>PIO Assigned</label>
                    <p>{request.assignedPIO?.name || 'Not assigned yet'}</p>
                  </div>
                </div>
                <div className="info-item">
                  <FaCalendarAlt className="info-icon" />
                  <div>
                    <label>Deadline</label>
                    <p className={new Date(request.deadline) < new Date() ? 'text-danger' : ''}>
                      {new Date(request.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="info-item">
                  <FaMoneyBillWave className="info-icon" />
                  <div>
                    <label>Fee Status</label>
                    <p>
                      {request.feeDetails?.status === 'paid' ? (
                        <span className="text-success">Paid on {new Date(request.feeDetails.paidAt).toLocaleDateString()}</span>
                      ) : (
                        <span className="text-warning">Pending - ₹10</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subject and Description */}
            <div className="info-section">
              <h3>Subject</h3>
              <p className="subject-text">{request.subject}</p>
              
              <h3>Description</h3>
              <p className="description-text">{request.description}</p>
            </div>

            {/* Questions */}
            <div className="info-section">
              <h3>Questions</h3>
              <div className="questions-list">
                {request.questions.map((q, index) => (
                  <div key={index} className="question-item">
                    <div className="question-number">Q{index + 1}.</div>
                    <div className="question-content">
                      <p className="question-text">{q.question}</p>
                      {q.answer && (
                        <div className="answer-box">
                          <strong>Answer:</strong>
                          <p>{q.answer}</p>
                          {q.answeredAt && (
                            <small>Answered on: {new Date(q.answeredAt).toLocaleDateString()}</small>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            {request.documents?.length > 0 && (
              <div className="info-section">
                <h3>Your Documents</h3>
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
                      <FaDownload className="document-download" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Response */}
            {request.response && (
              <div className="info-section response-section">
                <h3>Response from Department</h3>
                <div className="response-box">
                  <p className="response-text">{request.response.text}</p>
                  {request.response.documents?.length > 0 && (
                    <>
                      <h4>Response Documents</h4>
                      <div className="documents-list">
                        {request.response.documents.map((doc, index) => (
                          <a
                            key={index}
                            href={`http://localhost:5000/${doc.path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="document-item"
                          >
                            {getFileIcon(doc.mimeType)}
                            <span className="document-name">{doc.originalName}</span>
                            <FaDownload className="document-download" />
                          </a>
                        ))}
                      </div>
                    </>
                  )}
                  <div className="response-meta">
                    <span>Responded on: {new Date(request.response.respondedAt).toLocaleDateString()}</span>
                    {request.response.respondedBy && (
                      <span>By: {request.response.respondedBy.name}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Appeal Information */}
            {request.appeal?.filed && (
              <div className="info-section appeal-section">
                <h3>Appeal Details</h3>
                <div className="appeal-box">
                  <p><strong>Reason for Appeal:</strong> {request.appeal.reason}</p>
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
                      <p><strong>Decided on:</strong> {new Date(request.appeal.decidedAt).toLocaleDateString()}</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="info-section">
              <h3>Timeline</h3>
              <div className="timeline">
                {request.timeline?.map((entry, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-status">{entry.status}</span>
                        <span className="timeline-date">
                          {new Date(entry.updatedAt).toLocaleString()}
                        </span>
                      </div>
                      {entry.remark && (
                        <p className="timeline-remark">{entry.remark}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="actions-sidebar">
            {/* Actions Card */}
            <div className="actions-card">
              <h3>Actions</h3>
              
              {canPayFee && (
                <button onClick={handlePayFee} className="btn btn-primary btn-block">
                  <FaMoneyBillWave /> Pay Fee (₹10)
                </button>
              )}

              {canFileAppeal && !showAppealForm && (
                <button 
                  onClick={() => setShowAppealForm(true)} 
                  className="btn btn-warning btn-block"
                >
                  <FaGavel /> File Appeal
                </button>
              )}

              {request.response?.documents?.length > 0 && (
                <a
                  href={`http://localhost:5000/${request.response.documents[0].path}`}
                  download
                  className="btn btn-outline-primary btn-block"
                >
                  <FaDownload /> Download All Responses
                </a>
              )}

              <Link to="/submit-rti" className="btn btn-outline btn-block">
                <FaPaperPlane /> File New RTI
              </Link>
            </div>

            {/* Appeal Form */}
            {showAppealForm && (
              <div className="appeal-form-card">
                <h3>File Appeal</h3>
                <form onSubmit={handleFileAppeal}>
                  <div className="form-group">
                    <label>Reason for Appeal</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={appealReason}
                      onChange={(e) => setAppealReason(e.target.value)}
                      placeholder="Explain why you are appealing this decision..."
                      required
                    ></textarea>
                  </div>
                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setShowAppealForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submittingAppeal}
                    >
                      {submittingAppeal ? <Loader size="small" /> : 'Submit Appeal'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Info Card */}
            <div className="info-card">
              <h4>Need Help?</h4>
              <p>If you have any questions about your RTI application, you can:</p>
              <ul>
                <li>Contact the PIO directly</li>
                <li>Call our helpline: 1800-123-4567</li>
                <li>Email: support@rticonnect.gov.in</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;