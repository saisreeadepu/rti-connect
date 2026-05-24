import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { pioAPI } from '../utils/api';
import { 
  FaClipboardList, 
  FaClock, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaArrowRight,
  FaFileAlt,
  FaUser,
  FaBuilding,
  FaBell,
  FaChartLine
} from 'react-icons/fa';
import Loader from '../components/Loader';
import './PIODashboard.css';
import toast from 'react-hot-toast';

const PIODashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    overdue: 0,
    resolved: 0
  });
  const [pendingRequests, setPendingRequests] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        pioAPI.getDashboard(),
        pioAPI.getPending()
      ]);

      setStats(statsRes.data);
      setPendingRequests(pendingRes.data);

      // Create recent activity from pending requests
      const activity = pendingRes.data.slice(0, 5).map(req => ({
        id: req._id,
        requestId: req.requestId,
        action: 'New request assigned',
        time: new Date(req.createdAt).toLocaleString(),
        citizen: req.citizen?.name
      }));
      setRecentActivity(activity);
    } catch (error) {
      console.error('Error fetching PIO dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'fee-paid': { class: 'badge-info', label: 'Fee Paid' },
      'under-review': { class: 'badge-warning', label: 'Under Review' },
      'forwarded': { class: 'badge-info', label: 'Forwarded' }
    };
    const config = statusConfig[status] || { class: 'badge-secondary', label: status };
    return <span className={`badge ${config.class}`}>{config.label}</span>;
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="pio-dashboard-page">
      <div className="container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div>
            <h1 className="welcome-title">
              Welcome, PIO {user?.name} 👋
            </h1>
            <p className="welcome-subtitle">
              {user?.department} - Manage and respond to RTI requests
            </p>
          </div>
          <div className="department-badge">
            <FaBuilding /> {user?.department}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <FaClipboardList />
            </div>
            <div className="stat-details">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Assigned</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending">
              <FaClock />
            </div>
            <div className="stat-details">
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon overdue">
              <FaExclamationTriangle />
            </div>
            <div className="stat-details">
              <div className="stat-value">{stats.overdue}</div>
              <div className="stat-label">Overdue</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon resolved">
              <FaCheckCircle />
            </div>
            <div className="stat-details">
              <div className="stat-value">{stats.resolved}</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Pending Requests */}
          <div className="dashboard-card pending-requests">
            <div className="card-header">
              <h3>
                <FaClock /> Pending Requests
                {stats.overdue > 0 && (
                  <span className="overdue-warning">
                    {stats.overdue} overdue
                  </span>
                )}
              </h3>
              <Link to="/pio-requests" className="view-all">
                View All <FaArrowRight />
              </Link>
            </div>
            <div className="card-body">
              {pendingRequests.length === 0 ? (
                <div className="empty-state">
                  <FaCheckCircle className="empty-icon" />
                  <p>No pending requests! Great job!</p>
                </div>
              ) : (
                <div className="requests-list">
                  {pendingRequests.slice(0, 5).map(request => {
                    const daysLeft = Math.ceil((new Date(request.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                    const isOverdue = daysLeft < 0;
                    
                    return (
                      <Link 
                        to={`/pio-request/${request.requestId}`} 
                        key={request._id}
                        className={`request-item ${isOverdue ? 'overdue' : ''}`}
                      >
                        <div className="request-info">
                          <h4 className="request-title">{request.subject}</h4>
                          <div className="request-meta">
                            <span className="request-id">#{request.requestId}</span>
                            <span className="request-citizen">
                              <FaUser /> {request.citizen?.name}
                            </span>
                          </div>
                        </div>
                        <div className="request-deadline">
                          {isOverdue ? (
                            <span className="deadline-overdue">
                              <FaExclamationTriangle /> Overdue by {Math.abs(daysLeft)} days
                            </span>
                          ) : (
                            <span className="deadline-normal">
                              <FaClock /> {daysLeft} days left
                            </span>
                          )}
                        </div>
                        {getStatusBadge(request.status)}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="dashboard-card quick-stats">
            <div className="card-header">
              <h3><FaChartLine /> Performance</h3>
            </div>
            <div className="card-body">
              <div className="performance-metrics">
                <div className="metric">
                  <div className="metric-label">Resolution Rate</div>
                  <div className="metric-value">
                    {stats.total ? ((stats.resolved / stats.total) * 100).toFixed(1) : 0}%
                  </div>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill"
                      style={{ width: `${stats.total ? (stats.resolved / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="metric">
                  <div className="metric-label">On-Time Responses</div>
                  <div className="metric-value">
                    {stats.total ? ((stats.resolved - stats.overdue) / stats.resolved * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>

              <div className="quick-actions">
                <h4>Quick Actions</h4>
                <Link to="/pio-requests?status=pending" className="action-link">
                  <FaClock /> View All Pending
                </Link>
                <Link to="/pio-requests?status=overdue" className="action-link">
                  <FaExclamationTriangle /> View Overdue
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-card recent-activity">
            <div className="card-header">
              <h3><FaBell /> Recent Activity</h3>
            </div>
            <div className="card-body">
              {recentActivity.length === 0 ? (
                <div className="empty-state">
                  <p>No recent activity</p>
                </div>
              ) : (
                <div className="activity-list">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon">
                        <FaFileAlt />
                      </div>
                      <div className="activity-details">
                        <p className="activity-text">
                          <strong>{activity.action}</strong> - {activity.requestId}
                        </p>
                        <p className="activity-meta">
                          Citizen: {activity.citizen} • {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Department Info */}
          <div className="dashboard-card department-info">
            <div className="card-header">
              <h3><FaBuilding /> Department Info</h3>
            </div>
            <div className="card-body">
              <div className="info-item">
                <label>Department</label>
                <p>{user?.department}</p>
              </div>
              <div className="info-item">
                <label>Office Hours</label>
                <p>Monday - Friday: 10:00 AM - 6:00 PM</p>
              </div>
              <div className="info-item">
                <label>Response Deadline</label>
                <p>30 days from receipt</p>
              </div>
              <div className="info-item">
                <label>Contact Support</label>
                <p>pio-support@rticonnect.gov.in</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PIODashboard;