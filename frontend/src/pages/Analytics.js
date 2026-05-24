import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../utils/api';
import { 
  FaChartBar, 
  FaDownload, 
  FaCalendarAlt,
  FaBuilding,
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaFileAlt,
  FaMoneyBillWave
} from 'react-icons/fa';
import Loader from '../components/Loader';
import './Analytics.css';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [exportFormat, setExportFormat] = useState('csv');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getDashboard();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await analyticsAPI.exportReport({
        format: exportFormat,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rti-report.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  // Chart configurations
  const statusChartData = {
    labels: analytics?.statusBreakdown?.map(item => item._id) || [],
    datasets: [
      {
        label: 'Number of Requests',
        data: analytics?.statusBreakdown?.map(item => item.count) || [],
        backgroundColor: [
          '#fef3c7', '#fed7aa', '#cffafe', '#dbeafe', '#ede9fe', '#d1fae5', '#fee2e2', '#fbcfe8'
        ],
        borderColor: [
          '#92400e', '#9a3412', '#0e7490', '#1e40af', '#6b21a8', '#065f46', '#991b1b', '#9d174d'
        ],
        borderWidth: 1
      }
    ]
  };

  const monthlyTrendsData = {
    labels: analytics?.monthlyTrends?.map(item => {
      const [year, month] = item.month.split('-');
      return `${month}/${year}`;
    }) || [],
    datasets: [
      {
        label: 'Submitted',
        data: analytics?.monthlyTrends?.map(item => item.submitted) || [],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.5)',
        tension: 0.4
      },
      {
        label: 'Resolved',
        data: analytics?.monthlyTrends?.map(item => item.resolved) || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.4
      }
    ]
  };

  const departmentPerformanceData = {
    labels: analytics?.departmentPerformance?.map(dept => dept.name) || [],
    datasets: [
      {
        label: 'Total Requests',
        data: analytics?.departmentPerformance?.map(dept => dept.totalRequests) || [],
        backgroundColor: '#3b82f6',
      },
      {
        label: 'Resolved',
        data: analytics?.departmentPerformance?.map(dept => dept.resolvedRequests) || [],
        backgroundColor: '#10b981',
      }
    ]
  };

  const responseTimeData = {
    labels: analytics?.responseTimes?.map(rt => rt._id) || [],
    datasets: [
      {
        label: 'Average Response Time (days)',
        data: analytics?.responseTimes?.map(rt => rt.avgResponseTime.toFixed(1)) || [],
        backgroundColor: '#f59e0b',
      }
    ]
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="analytics-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <FaChartBar /> Analytics Dashboard
            </h1>
            <p className="page-subtitle">
              Comprehensive insights into RTI system performance
            </p>
          </div>
          
          {/* Export Controls */}
          <div className="export-controls">
            <div className="date-range">
              <FaCalendarAlt />
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="form-control"
              />
              <span>to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="form-control"
              />
            </div>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="form-control export-format"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
            <button onClick={handleExport} className="btn btn-primary">
              <FaDownload /> Export Report
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon total">
              <FaFileAlt />
            </div>
            <div className="summary-details">
              <div className="summary-value">{analytics.overall.totalRequests}</div>
              <div className="summary-label">Total RTIs</div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon resolved">
              <FaCheckCircle />
            </div>
            <div className="summary-details">
              <div className="summary-value">{analytics.overall.resolvedRequests}</div>
              <div className="summary-label">Resolved</div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon pending">
              <FaClock />
            </div>
            <div className="summary-details">
              <div className="summary-value">{analytics.overall.pendingRequests}</div>
              <div className="summary-label">Pending</div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon rate">
              <FaChartBar />
            </div>
            <div className="summary-details">
              <div className="summary-value">{analytics.overall.resolutionRate}%</div>
              <div className="summary-label">Resolution Rate</div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          {/* Status Distribution */}
          <div className="chart-card">
            <h3 className="chart-title">Request Status Distribution</h3>
            <div className="chart-container">
              <Pie data={statusChartData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }} />
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="chart-card">
            <h3 className="chart-title">Monthly Trends (Last 6 Months)</h3>
            <div className="chart-container">
              <Line data={monthlyTrendsData} options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }} />
            </div>
          </div>

          {/* Department Performance */}
          <div className="chart-card full-width">
            <h3 className="chart-title">Department Performance</h3>
            <div className="chart-container">
              <Bar data={departmentPerformanceData} options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }} />
            </div>
          </div>

          {/* Response Times */}
          <div className="chart-card">
            <h3 className="chart-title">Average Response Time by Department</h3>
            <div className="chart-container">
              <Bar data={responseTimeData} options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Days'
                    }
                  }
                }
              }} />
            </div>
          </div>

          {/* User Statistics */}
          <div className="chart-card">
            <h3 className="chart-title">User Statistics</h3>
            <div className="user-stats">
              <div className="user-stat">
                <FaUsers className="stat-icon" />
                <div>
                  <div className="stat-number">{analytics.userStats.totalCitizens}</div>
                  <div className="stat-label">Citizens</div>
                </div>
              </div>
              <div className="user-stat">
                <FaBuilding className="stat-icon" />
                <div>
                  <div className="stat-number">{analytics.userStats.totalPIOs}</div>
                  <div className="stat-label">PIOs</div>
                </div>
              </div>
              <div className="user-stat">
                <FaCheckCircle className="stat-icon" />
                <div>
                  <div className="stat-number">{analytics.userStats.totalAppellate}</div>
                  <div className="stat-label">Appellate</div>
                </div>
              </div>
              <div className="user-stat">
                <FaClock className="stat-icon" />
                <div>
                  <div className="stat-number">{analytics.userStats.activeToday}</div>
                  <div className="stat-label">Active Today</div>
                </div>
              </div>
            </div>
          </div>

          {/* Fee Statistics */}
          {analytics.feeStats && (
            <div className="chart-card">
              <h3 className="chart-title">Fee Collection</h3>
              <div className="fee-stats">
                <div className="fee-stat">
                  <FaMoneyBillWave className="fee-icon" />
                  <div>
                    <div className="fee-amount">₹{analytics.feeStats.totalFees}</div>
                    <div className="fee-label">Total Collection</div>
                  </div>
                </div>
                <div className="fee-stat">
                  <FaFileAlt className="fee-icon" />
                  <div>
                    <div className="fee-amount">{analytics.feeStats.totalPayments}</div>
                    <div className="fee-label">Paid Applications</div>
                  </div>
                </div>
                <div className="fee-stat">
                  <FaChartBar className="fee-icon" />
                  <div>
                    <div className="fee-amount">₹{analytics.feeStats.averageFee.toFixed(2)}</div>
                    <div className="fee-label">Average Fee</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Tables */}
        <div className="tables-section">
          <h2 className="section-title">Department-wise Detailed Statistics</h2>
          <div className="table-responsive">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Total Requests</th>
                  <th>Resolved</th>
                  <th>Pending</th>
                  <th>Resolution Rate</th>
                  <th>Avg Response Time</th>
                  <th>On Time</th>
                  <th>Delayed</th>
                </tr>
              </thead>
              <tbody>
                {analytics.departmentPerformance.map(dept => (
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
                    <td>{dept.avgResponseTime?.toFixed(1) || 'N/A'} days</td>
                    <td>{dept.onTimeResponses || 0}</td>
                    <td>{dept.delayedResponses || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;