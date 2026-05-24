import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../utils/api';
import { 
  FaUsers, 
  FaBuilding, 
  FaFileAlt, 
  FaCheckCircle, 
  FaClock,
  FaExclamationTriangle,
  FaChartBar,
  FaArrowRight,
  FaUserTie,
  FaBalanceScale
} from 'react-icons/fa';
import Loader from '../components/Loader';
import './AdminDashboard.css';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    overall: {
      totalRequests: 0,
      resolvedRequests: 0,
      pendingRequests: 0,
      appealedRequests: 0,
      resolutionRate: 0
    },
    departmentPerformance: [],
    userStats: {
      totalCitizens: 0,
      totalPIOs: 0,
      totalAppellate: 0,
      activeToday: 0
    },
    monthlyTrends: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="admin-dashboard-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">
            System overview and performance metrics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <FaFileAlt />
            </div>
            <div className="stat-details">
              <div className="stat-value">{stats.overall.totalRequests}</div>
              <div className="stat-label">Total RTIs</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending">
              <FaClock />
            </div>
            <div className="stat-details">
              <div className="stat-value">{stats.overall.pendingRequests}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon resolved">
              <FaCheckCircle />
            </div>
            <div className="stat-details">
              <div className="stat-value">{stats.overall.resolvedRequests}</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon appealed">
              <FaExclamationTriangle />
            </div>
            <div className="stat-details">
              <div className="stat-value">{stats.overall.appealedRequests}</div>
              <div className="stat-label">Appealed</div>
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="user-stats-grid">
          <div className="user-stat-card">
            <FaUsers className="user-icon" />
            <div>
              <div className="user-stat-value">{stats.userStats.totalCitizens}</div>
              <div className="user-stat-label">Citizens</div>
            </div>
          </div>
          <div className="user-stat-card">
            <FaUserTie className="user-icon" />
            <div>
              <div className="user-stat-value">{stats.userStats.totalPIOs}</div>
              <div className="user-stat-label">PIOs</div>
            </div>
          </div>
          <div className="user-stat-card">
            <FaBalanceScale className="user-icon" />
            <div>
              <div className="user-stat-value">{stats.userStats.totalAppellate}</div>
              <div className="user-stat-label">Appellate</div>
            </div>
          </div>
          <div className="user-stat-card">
            <FaClock className="user-icon" />
            <div>
              <div className="user-stat-value">{stats.userStats.activeToday}</div>
              <div className="user-stat-label">Active Today</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Department Performance */}
          <div className="dashboard-card department-performance">
            <div className="card-header">
              <h3>
                <FaBuilding /> Department Performance
              </h3>
              <Link to="/admin/departments" className="view-all">
                Manage <FaArrowRight />
              </Link>
            </div>
            <div className="card-body">
              <table className="performance-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Total</th>
                    <th>Resolved</th>
                    <th>Pending</th>
                    <th>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.departmentPerformance.slice(0, 5).map(dept => (
                    <tr key={dept.name}>
                      <td>{dept.name}</td>
                      <td>{dept.totalRequests}</td>
                      <td>{dept.resolvedRequests}</td>
                      <td>{dept.pendingRequests}</td>
                      <td>
                        <span className={`rate-badge ${
                          dept.performance > 70 ? 'high' : dept.performance > 40 ? 'medium' : 'low'
                        }`}>
                          {dept.performance}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="dashboard-card monthly-trends">
            <div className="card-header">
              <h3>
                <FaChartBar /> Monthly Trends
              </h3>
            </div>
            <div className="card-body">
              <div className="trends-chart">
                {stats.monthlyTrends.map((trend, index) => (
                  <div key={index} className="trend-bar">
                    <div 
                      className="bar-fill"
                      style={{ height: `${(trend.submitted / Math.max(...stats.monthlyTrends.map(t => t.submitted)) * 100)}%` }}
                    ></div>
                    <span className="bar-label">{trend.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card quick-actions">
            <div className="card-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="card-body">
              <div className="actions-grid">
                <Link to="/admin/users" className="action-item">
                  <FaUsers />
                  <span>Manage Users</span>
                </Link>
                <Link to="/admin/departments" className="action-item">
                  <FaBuilding />
                  <span>Departments</span>
                </Link>
                <Link to="/admin/analytics" className="action-item">
                  <FaChartBar />
                  <span>Analytics</span>
                </Link>
                <Link to="/admin/settings" className="action-item">
                  <FaClock />
                  <span>Settings</span>
                </Link>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="dashboard-card system-status">
            <div className="card-header">
              <h3>System Status</h3>
            </div>
            <div className="card-body">
              <div className="status-item">
                <span className="status-label">Resolution Rate</span>
                <span className="status-value">{stats.overall.resolutionRate}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${stats.overall.resolutionRate}%` }}
                ></div>
              </div>
              
              <div className="status-item">
                <span className="status-label">Active Users Today</span>
                <span className="status-value">{stats.userStats.activeToday}</span>
              </div>
              
              <div className="status-item">
                <span className="status-label">System Health</span>
                <span className="status-value good">Good</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;