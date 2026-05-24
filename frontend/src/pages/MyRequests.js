import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rtiAPI } from '../utils/api';
import { 
  FaSearch, 
  FaFilter, 
  FaFileAlt, 
  FaClock, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaEye,
  FaDownload,
  FaSortAmountDown
} from 'react-icons/fa';
import Loader from '../components/Loader';
import './MyRequests.css';
import toast from 'react-hot-toast';

const MyRequests = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    sort: 'newest'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.sort, pagination.page]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await rtiAPI.getMyRequests({
        status: filters.status !== 'all' ? filters.status : undefined,
        page: pagination.page,
        limit: 10
      });
      
      setRequests(response.data.requests);
      setPagination({
        page: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load your RTI requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search logic
    fetchRequests();
  };

  const handleStatusChange = (status) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  };

  const handleSortChange = (sort) => {
    setFilters(prev => ({ ...prev, sort, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'submitted': { class: 'badge-warning', label: 'Submitted', icon: <FaClock /> },
      'fee-pending': { class: 'badge-warning', label: 'Fee Pending', icon: <FaClock /> },
      'fee-paid': { class: 'badge-info', label: 'Fee Paid', icon: <FaFileAlt /> },
      'under-review': { class: 'badge-info', label: 'Under Review', icon: <FaFileAlt /> },
      'forwarded': { class: 'badge-info', label: 'Forwarded', icon: <FaFileAlt /> },
      'replied': { class: 'badge-success', label: 'Replied', icon: <FaCheckCircle /> },
      'rejected': { class: 'badge-danger', label: 'Rejected', icon: <FaExclamationTriangle /> },
      'appealed': { class: 'badge-warning', label: 'Appealed', icon: <FaExclamationTriangle /> },
      'closed': { class: 'badge-secondary', label: 'Closed', icon: <FaCheckCircle /> }
    };

    const config = statusConfig[status] || statusConfig.submitted;
    return (
      <span className={`badge ${config.class}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const filteredRequests = requests.filter(request => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return request.requestId.toLowerCase().includes(searchLower) ||
             request.subject.toLowerCase().includes(searchLower);
    }
    return true;
  });

  return (
    <div className="my-requests-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">My RTI Requests</h1>
            <p className="page-subtitle">
              Track and manage all your RTI applications
            </p>
          </div>
          <Link to="/submit-rti" className="btn btn-primary">
            <FaFileAlt /> File New RTI
          </Link>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-box">
            <form onSubmit={handleSearch}>
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by Request ID or Subject"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="form-control"
              />
            </form>
          </div>

          <div className="filter-options">
            <div className="filter-group">
              <FaFilter className="filter-icon" />
              <select
                value={filters.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="form-control"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="fee-pending">Fee Pending</option>
                <option value="fee-paid">Fee Paid</option>
                <option value="under-review">Under Review</option>
                <option value="forwarded">Forwarded</option>
                <option value="replied">Replied</option>
                <option value="rejected">Rejected</option>
                <option value="appealed">Appealed</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="filter-group">
              <FaSortAmountDown className="filter-icon" />
              <select
                value={filters.sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="form-control"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="deadline">Deadline Approaching</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <Loader />
        ) : (
          <>
            {filteredRequests.length === 0 ? (
              <div className="empty-state">
                <FaFileAlt className="empty-icon" />
                <h3>No RTI requests found</h3>
                <p>You haven't filed any RTI applications yet.</p>
                <Link to="/submit-rti" className="btn btn-primary">
                  File Your First RTI
                </Link>
              </div>
            ) : (
              <div className="requests-list">
                {filteredRequests.map(request => (
                  <div key={request._id} className="request-card">
                    <div className="request-header">
                      <div className="request-id-badge">
                        #{request.requestId}
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="request-body">
                      <h3 className="request-subject">
                        <Link to={`/request/${request.requestId}`}>
                          {request.subject}
                        </Link>
                      </h3>
                      
                      <div className="request-details">
                        <div className="detail-item">
                          <span className="detail-label">Department:</span>
                          <span className="detail-value">{request.department}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Filed on:</span>
                          <span className="detail-value">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Deadline:</span>
                          <span className={`detail-value ${
                            new Date(request.deadline) < new Date() ? 'expired' : ''
                          }`}>
                            {new Date(request.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {request.response && (
                        <div className="response-indicator">
                          <FaCheckCircle className="response-icon" />
                          <span>Response received on {new Date(request.response.respondedAt).toLocaleDateString()}</span>
                        </div>
                      )}

                      {request.appeal?.filed && (
                        <div className="appeal-indicator">
                          <FaExclamationTriangle className="appeal-icon" />
                          <span>Appeal filed on {new Date(request.appeal.filedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="request-footer">
                      <Link 
                        to={`/request/${request.requestId}`} 
                        className="btn btn-outline-primary btn-sm"
                      >
                        <FaEye /> View Details
                      </Link>
                      
                      {request.status === 'replied' && request.response?.documents?.length > 0 && (
                        <button className="btn btn-outline-secondary btn-sm">
                          <FaDownload /> Download Response
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-outline"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  className="btn btn-outline"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyRequests;