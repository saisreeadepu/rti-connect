import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { pioAPI } from '../utils/api';
import { 
  FaSearch, 
  FaFilter, 
  FaFileAlt, 
  FaClock, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaEye,
  FaUser,
  FaSortAmountDown,
  FaRedoAlt
} from 'react-icons/fa';
import Loader from '../components/Loader';
import './PIORequests.css';
import toast from 'react-hot-toast';

const PIORequests = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [filters, setFilters] = useState({
    status: new URLSearchParams(location.search).get('status') || 'all',
    search: '',
    sort: 'deadline_asc'
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
      const response = await pioAPI.getRequests({
        status: filters.status !== 'all' ? filters.status : undefined,
        page: pagination.page,
        limit: 10
      });
      
      setRequests(response.data.requests || []);
      setPagination({
        page: response.data.currentPage || 1,
        totalPages: response.data.totalPages || 1,
        total: response.data.total || 0
      });
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleRefresh = () => {
    fetchRequests();
    toast.success('Refreshed!');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'submitted': { class: 'badge-warning', label: 'Submitted', icon: <FaFileAlt /> },
      'fee-pending': { class: 'badge-warning', label: 'Fee Pending', icon: <FaClock /> },
      'fee-paid': { class: 'badge-info', label: 'Fee Paid', icon: <FaCheckCircle /> },
      'under-review': { class: 'badge-warning', label: 'Under Review', icon: <FaClock /> },
      'forwarded': { class: 'badge-info', label: 'Forwarded', icon: <FaRedoAlt /> },
      'replied': { class: 'badge-success', label: 'Replied', icon: <FaCheckCircle /> },
      'rejected': { class: 'badge-danger', label: 'Rejected', icon: <FaExclamationTriangle /> }
    };
    const config = statusConfig[status] || { class: 'badge-secondary', label: status, icon: <FaFileAlt /> };
    return (
      <span className={`badge ${config.class}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const getDaysLeft = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="pio-requests-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">PIO Requests</h1>
            <p className="page-subtitle">
              Manage and respond to RTI requests assigned to your department
            </p>
          </div>
          <button onClick={handleRefresh} className="btn btn-outline-primary">
            <FaRedoAlt /> Refresh
          </button>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <form onSubmit={handleSearch}>
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by ID, Subject, or Citizen Name"
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
                onChange={(e) => handleFilterChange('status', e.target.value)}
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
              </select>
            </div>

            <div className="filter-group">
              <FaSortAmountDown className="filter-icon" />
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="form-control"
              >
                <option value="deadline_asc">Deadline (Earliest First)</option>
                <option value="deadline_desc">Deadline (Latest First)</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="empty-state">
            <FaFileAlt className="empty-icon" />
            <h3>No requests found</h3>
            <p>There are no RTI requests matching your criteria.</p>
          </div>
        ) : (
          <div className="requests-table-container">
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Citizen</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Deadline</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(request => {
                  const daysLeft = getDaysLeft(request.deadline);
                  const isOverdue = daysLeft < 0;
                  
                  return (
                    <tr key={request._id} className={isOverdue ? 'overdue-row' : ''}>
                      <td>
                        <span className="request-id">#{request.requestId}</span>
                      </td>
                      <td>
                        <div className="citizen-info">
                          <FaUser className="citizen-icon" />
                          <div>
                            <div className="citizen-name">{request.citizen?.name || 'N/A'}</div>
                            <div className="citizen-phone">{request.citizen?.phone || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="subject-cell">
                          <div className="subject-text">{request.subject}</div>
                          <div className="submitted-date">
                            Filed: {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td>{getStatusBadge(request.status)}</td>
                      <td>
                        <div className={`deadline-cell ${isOverdue ? 'overdue' : ''}`}>
                          <div className="deadline-date">
                            {new Date(request.deadline).toLocaleDateString()}
                          </div>
                          <div className="deadline-days">
                            {isOverdue ? (
                              <span className="overdue-text">
                                <FaExclamationTriangle /> {Math.abs(daysLeft)} days overdue
                              </span>
                            ) : (
                              <span className="days-left">
                                <FaClock /> {daysLeft} days left
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <Link 
                          to={`/pio-request/${request.requestId}`}
                          className="btn btn-outline-primary btn-sm"
                        >
                          <FaEye /> View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              Previous
            </button>
            <span className="page-info">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              className="btn btn-outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PIORequests;