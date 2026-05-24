import React, { useState, useEffect } from 'react';
import { FaChartBar, FaCheckCircle, FaClock, FaBuilding } from 'react-icons/fa';
import './TransparencyDashboard.css';

const TransparencyDashboard = () => {
  const [stats, setStats] = useState({
    totalFiled: 0,
    totalResolved: 0,
    averageResolutionTime: 0,
    topDepartments: []
  });

  useEffect(() => {
    // Mock fetching data for public transparency dashboard
    setTimeout(() => {
      setStats({
        totalFiled: 15420,
        totalResolved: 14250,
        averageResolutionTime: 22,
        topDepartments: [
          { name: 'Revenue Department', count: 4500 },
          { name: 'Municipal Corporation', count: 3200 },
          { name: 'Police Department', count: 2100 },
          { name: 'Education Department', count: 1800 }
        ]
      });
    }, 1000);
  }, []);

  return (
    <div className="transparency-page">
      <div className="container">
        <div className="page-header text-center">
          <h1 className="page-title">Transparency Dashboard</h1>
          <p className="page-subtitle">Real-time statistics on RTI filings and resolutions across all departments.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card glass-panel text-center">
            <div className="stat-icon" style={{ color: 'var(--primary-color)', fontSize: '2rem', marginBottom: '1rem' }}>
              <FaChartBar />
            </div>
            <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.totalFiled.toLocaleString()}</div>
            <div className="stat-label">Total RTIs Filed</div>
          </div>

          <div className="stat-card glass-panel text-center">
            <div className="stat-icon" style={{ color: 'var(--success-color)', fontSize: '2rem', marginBottom: '1rem' }}>
              <FaCheckCircle />
            </div>
            <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.totalResolved.toLocaleString()}</div>
            <div className="stat-label">RTIs Resolved</div>
          </div>

          <div className="stat-card glass-panel text-center">
            <div className="stat-icon" style={{ color: 'var(--warning-color)', fontSize: '2rem', marginBottom: '1rem' }}>
              <FaClock />
            </div>
            <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.averageResolutionTime} Days</div>
            <div className="stat-label">Avg. Resolution Time</div>
          </div>
        </div>

        <div className="dashboard-grid mt-8" style={{ gridTemplateColumns: '1fr' }}>
          <div className="dashboard-card glass-panel">
            <div className="card-header">
              <h3><FaBuilding /> Top Departments by RTI Volume</h3>
            </div>
            <div className="card-body">
              <div className="department-list">
                {stats.topDepartments.map((dept, index) => (
                  <div key={index} className="department-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ fontWeight: '600' }}>{dept.name}</span>
                    <span className="badge badge-info">{dept.count.toLocaleString()} Requests</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransparencyDashboard;
