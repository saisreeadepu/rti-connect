import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rtiAPI, analyticsAPI, notificationsAPI } from '../utils/api';
import { 
  FaFileAlt, 
  FaClipboardList, 
  FaCheckCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaChartLine,
  FaBell,
  FaArrowRight
} from 'react-icons/fa';
import Loader from '../components/Loader';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    appealed: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's RTI requests
      const requestsResponse = await rtiAPI.getMyRequests({ limit: 5 });
      const requests = requestsResponse.data.requests;
      setRecentRequests(requests);

      // Calculate stats
      const stats = {
        total: requestsResponse.data.total,
        pending: requests.filter(r => ['submitted', 'fee-pending', 'fee-paid', 'under-review', 'forwarded'].includes(r.status)).length,
        resolved: requests.filter(r => ['replied', 'rejected', 'closed'].includes(r.status)).length,
        appealed: requests.filter(r => r.appeal?.filed).length
      };
      setStats(stats);

      // Fetch notifications
      const notifResponse = await notificationsAPI.getAll({ limit: 5 });
      setNotifications(notifResponse.data.notifications);

      // Fetch citizen analytics
      if (user) {
        const analyticsResponse = await analyticsAPI.getCitizenStats(user.id);
        setAnalytics(analyticsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'submitted': 'badge-warning',
      'fee-pending': 'badge-warning',
      'fee-paid': 'badge-info',
      'under-review': 'badge-info',
      'forwarded': 'badge-info',
      'replied': 'badge-success',
      'rejected': 'badge-danger',
      'appealed': 'badge-warning',
      'closed': 'badge-secondary'
    };

    const statusLabels = {
      'submitted': 'Submitted',
      'fee-pending': 'Fee Pending',
      'fee-paid': 'Fee Paid',
      'under-review': 'Under Review',
      'forwarded': 'Forwarded',
      'replied': 'Replied',
      'rejected': 'Rejected',
      'appealed': 'Appealed',
      'closed': 'Closed'
    };

    return (
      <span className={`badge ${statusClasses[status] || 'badge-secondary'}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const calculateDeadline = (createdAt) => {
    const createdDate = new Date(createdAt);
    const deadlineDate = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const today = new Date();
    const daysLeft = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return { days: Math.abs(daysLeft), percentage: 100, isOverdue: true };
    return { 
      days: daysLeft, 
      percentage: Math.min(100, ((30 - daysLeft) / 30) * 100),
      isOverdue: false 
    };
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-content">
            <h1 className="welcome-title">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="welcome-subtitle">
              Here's what's happening with your RTI applications
            </p>
          </div>
          <Link to="/submit-rti" className="btn btn-primary">
            <FaFileAlt /> File New RTI
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card glass-panel">
            <div className="stat-icon total">
              <FaClipboardList />
            </div>
            <div className="stat-details">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Applications</div>
            </div>
          </div>

          <div className="stat-card glass-panel">
            <div className="stat-icon pending">
              <FaClock />
            </div>
            <div className="stat-details">
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>

          <div className="stat-card glass-panel">
            <div className="stat-icon resolved">
              <FaCheckCircle />
            </div>
            <div className="stat-details">
              <div className="stat-value">{stats.resolved}</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>

          <div className="stat-card glass-panel">
            <div className="stat-icon appealed">
              <FaExclamationTriangle />
            </div>
            <div className="stat-details">
              <div className="stat-value">{stats.appealed}</div>
              <div className="stat-label">Appealed</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Recent Applications */}
          <div className="dashboard-card recent-applications glass-panel">
            <div className="card-header">
              <h3>Recent Applications</h3>
              <Link to="/my-requests" className="view-all">
                View All <FaArrowRight />
              </Link>
            </div>
            <div className="card-body">
              {recentRequests.length === 0 ? (
                <div className="empty-state">
                  <FaFileAlt className="empty-icon" />
                  <p>No RTI applications yet</p>
                  <Link to="/submit-rti" className="btn btn-outline-primary">
                    File Your First RTI
                  </Link>
                </div>
              ) : (
                <div className="requests-list">
                  {recentRequests.map(request => {
                    const isPending = ['submitted', 'fee-pending', 'fee-paid', 'under-review', 'forwarded'].includes(request.status);
                    const deadline = isPending ? calculateDeadline(request.createdAt) : null;
                    return (
                    <Link 
                      to={`/request/${request.requestId}`} 
                      key={request._id}
                      className="request-item"
                    >
                      <div className="request-info">
                        <h4 className="request-title">{request.subject}</h4>
                        <div className="request-meta">
                          <span className="request-id">ID: {request.requestId}</span>
                          <span className="request-date">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {isPending && deadline && (
                          <div className="deadline-tracker" style={{marginTop: '10px'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px'}}>
                              <span>Deadline (30 days)</span>
                              <span style={{color: deadline.isOverdue ? '#d32f2f' : '#138808'}}>
                                {deadline.isOverdue ? `${deadline.days} days overdue` : `${deadline.days} days left`}
                              </span>
                            </div>
                            <div className="progress-bar" style={{height: '6px', background: '#e0e0e0', borderRadius: '3px'}}>
                              <div className="progress-fill" style={{
                                width: `${deadline.percentage}%`, 
                                height: '100%', 
                                background: deadline.isOverdue ? '#d32f2f' : (deadline.percentage > 80 ? '#fbc02d' : '#138808'),
                                borderRadius: '3px'
                              }}></div>
                            </div>
                            {deadline.isOverdue && (
                                <div style={{marginTop: '8px', padding: '6px 10px', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'}}>
                                  ⚠️ Overdue! Click to escalate to First Appeal
                                </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="request-status">
                        {getStatusBadge(request.status)}
                      </div>
                    </Link>
                  )})}
                </div>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="dashboard-card notifications glass-panel">
            <div className="card-header">
              <h3>Recent Notifications</h3>
              <Link to="/notifications" className="view-all">
                View All <FaArrowRight />
              </Link>
            </div>
            <div className="card-body">
              {notifications.length === 0 ? (
                <div className="empty-state">
                  <FaBell className="empty-icon" />
                  <p>No new notifications</p>
                </div>
              ) : (
                <div className="notifications-list">
                  {notifications.map(notif => (
                    <div key={notif._id} className="notification-item">
                      <div className="notification-content">
                        <h4>{notif.title}</h4>
                        <p>{notif.message}</p>
                        <span className="notification-time">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {!notif.isRead && <span className="unread-dot"></span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Analytics Summary */}
          {analytics && (
            <div className="dashboard-card analytics-summary glass-panel">
              <div className="card-header">
                <h3>Your Activity</h3>
                <FaChartLine className="card-icon" />
              </div>
              <div className="card-body">
                <div className="analytics-grid">
                  <div className="analytics-item">
                    <div className="analytics-value">{analytics.resolutionRate}%</div>
                    <div className="analytics-label">Resolution Rate</div>
                  </div>
                  <div className="analytics-item">
                    <div className="analytics-value">{analytics.monthlyTrend?.length || 0}</div>
                    <div className="analytics-label">This Month</div>
                  </div>
                  <div className="analytics-item">
                    <div className="analytics-value">{analytics.appealed}</div>
                    <div className="analytics-label">Appeals Filed</div>
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="quick-tips">
                  <h4>Quick Tips</h4>
                  <ul>
                    <li>✓ Check your pending applications regularly</li>
                    <li>✓ Upload clear supporting documents</li>
                    <li>✓ File appeal within 30 days of response</li>
                    <li>✓ Keep your contact details updated</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <Link to="/submit-rti" className="action-card">
              <FaFileAlt className="action-icon" />
              <span>File RTI</span>
            </Link>
            <Link to="/track" className="action-card">
              <FaClipboardList className="action-icon" />
              <span>Track Request</span>
            </Link>
            <Link to="/templates" className="action-card">
              <FaFileAlt className="action-icon" />
              <span>Use Template</span>
            </Link>
            <Link to="/departments" className="action-card">
              <FaClipboardList className="action-icon" />
              <span>Departments</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;