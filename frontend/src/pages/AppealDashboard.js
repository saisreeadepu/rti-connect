import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appealsAPI } from '../utils/api';
import { 
  FaGavel, 
  FaClock, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaArrowRight,
  FaUser,
  FaBuilding,
  FaBalanceScale
} from 'react-icons/fa';
import Loader from '../components/Loader';
import './AppealDashboard.css';
import toast from 'react-hot-toast';

const AppealDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    decided: 0,
    accepted: 0,
    rejected: 0
  });
  const [pendingAppeals, setPendingAppeals] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        appealsAPI.getStats(),
        appealsAPI.getPending()
      ]);

      setStats(statsRes.data);
      setPendingAppeals(pendingRes.data);
    } catch (error) {
      console.error('Error fetching appeal dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="appeal-dashboard-page">
      <div className="container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div>
            <h1 className="welcome-title">
              Welcome, Appellate Authority 👋
            </h1>
            <p className="welcome-subtitle">
              {user?.department} - Manage and decide on appeals
            </p>
          </div>
          <div className="role-badge">
            <FaBalanceScale /> Appellate Authority
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon pending">
              <FaClock />
            </div>
            <div className="stat-details">
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">Pending Appeals</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon decided">
              <FaCheckCircle />
            </div>
            <div className="stat-details">
              <div className="stat-value">{stats.decided}</div>
              <div className="stat-label">Decided</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon accepted">
              <FaCheckCircle />
            </div>
            <div className="stat-details">
              <div className="stat-value">{stats.accepted}</div>
              <div className="stat-label">Accepted</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon rejected">
              <FaExclamationTriangle />
            </div>
            <div className="stat-details">
              <div className="stat-value">{stats.rejected}</div>
              <div className="stat-label">Rejected</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Pending Appeals */}
          <div className="dashboard-card pending-appeals">
            <div className="card-header">
              <h3>
                <FaGavel /> Pending Appeals
              </h3>
              <Link to="/appeals/pending" className="view-all">
                View All <FaArrowRight />
              </Link>
            </div>
            <div className="card-body">
              {pendingAppeals.length === 0 ? (
                <div className="empty-state">
                  <FaCheckCircle className="empty-icon" />
                  <p>No pending appeals! Great job!</p>
                </div>
              ) : (
                <div className="appeals-list">
                  {pendingAppeals.slice(0, 5).map(appeal => (
                    <Link 
                      to={`/appeal/${appeal.requestId}`} 
                      key={appeal._id}
                      className="appeal-item"
                    >
                      <div className="appeal-info">
                        <h4 className="appeal-title">#{appeal.requestId}</h4>
                        <div className="appeal-meta">
                          <span className="appeal-citizen">
                            <FaUser /> {appeal.citizen?.name}
                          </span>
                          <span className="appeal-department">
                            <FaBuilding /> {appeal.department}
                          </span>
                        </div>
                        <p className="appeal-reason">
                          <strong>Reason:</strong> {appeal.appeal?.reason}
                        </p>
                      </div>
                      <div className="appeal-date">
                        Filed: {new Date(appeal.appeal?.filedAt).toLocaleDateString()}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="dashboard-card quick-stats">
            <div className="card-header">
              <h3><FaBalanceScale /> Appeal Statistics</h3>
            </div>
            <div className="card-body">
              <div className="stats-chart">
                <div className="stat-item">
                  <span className="stat-name">Acceptance Rate</span>
                  <span className="stat-percentage">
                    {stats.decided ? ((stats.accepted / stats.decided) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill success"
                    style={{ width: `${stats.decided ? (stats.accepted / stats.decided) * 100 : 0}%` }}
                  ></div>
                </div>

                <div className="stat-item">
                  <span className="stat-name">Rejection Rate</span>
                  <span className="stat-percentage">
                    {stats.decided ? ((stats.rejected / stats.decided) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill danger"
                    style={{ width: `${stats.decided ? (stats.rejected / stats.decided) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="recent-decisions">
                <h4>Recent Decisions</h4>
                <Link to="/appeals/decided" className="view-link">
                  View All Decided Appeals
                </Link>
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="dashboard-card guidelines">
            <div className="card-header">
              <h3><FaGavel /> Appeal Guidelines</h3>
            </div>
            <div className="card-body">
              <ul className="guidelines-list">
                <li>✓ Review the original RTI request and response</li>
                <li>✓ Consider the grounds for appeal carefully</li>
                <li>✓ Check if the PIO provided adequate response</li>
                <li>✓ Verify if information was wrongly denied</li>
                <li>✓ Ensure decision is within 30 days of appeal</li>
                <li>✓ Provide clear reasoning for your decision</li>
              </ul>
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
                <label>Decision Deadline</label>
                <p>30 days from appeal filing</p>
              </div>
              <div className="info-item">
                <label>Contact Support</label>
                <p>appellate-support@rticonnect.gov.in</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppealDashboard;