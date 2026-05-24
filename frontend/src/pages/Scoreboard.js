import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Scoreboard.css';

const Scoreboard = () => {
  const [sortBy, setSortBy] = useState('score');

  const departments = [
    { rank: 1, name: 'Department of Finance & Treasury', rtis: 95, responseRate: 93, avgSpeed: 9.8, onTime: 97, penalties: 0, score: 88, grade: 'A', icon: '🥇' },
    { rank: 2, name: 'Municipal Administration', rtis: 267, responseRate: 88, avgSpeed: 11.2, onTime: 94, penalties: 1, score: 82, grade: 'A', icon: '🥈' },
    { rank: 3, name: 'Department of Education', rtis: 145, responseRate: 88, avgSpeed: 12.3, onTime: 92, penalties: 2, score: 77, grade: 'B+', icon: '🥉' },
    { rank: 4, name: 'Department of Employment & Labour', rtis: 67, responseRate: 88, avgSpeed: 14.2, onTime: 88, penalties: 1, score: 77, grade: 'B+', icon: '#4' },
    { rank: 5, name: 'Department of Social Welfare', rtis: 156, responseRate: 90, avgSpeed: 13.5, onTime: 91, penalties: 3, score: 74, grade: 'B+', icon: '#5' },
    { rank: 6, name: 'Department of Health & Family Welfare', rtis: 203, responseRate: 88, avgSpeed: 15.7, onTime: 85, penalties: 5, score: 68, grade: 'B', icon: '#6' },
    { rank: 7, name: 'Department of Environment & Forests', rtis: 43, responseRate: 81, avgSpeed: 20.3, onTime: 80, penalties: 2, score: 65, grade: 'B', icon: '#7' },
    { rank: 8, name: 'Department of Police', rtis: 89, responseRate: 80, avgSpeed: 18.4, onTime: 82, penalties: 3, score: 63, grade: 'B', icon: '#8' },
    { rank: 9, name: 'Department of Revenue & Land Records', rtis: 312, responseRate: 79, avgSpeed: 22.1, onTime: 81, penalties: 12, score: 58, grade: 'C', icon: '#9' },
    { rank: 10, name: 'Department of Public Works', rtis: 178, responseRate: 75, avgSpeed: 24.5, onTime: 76, penalties: 8, score: 54, grade: 'C', icon: '#10' }
  ];

  const handleSort = (e) => {
    setSortBy(e.target.value);
  };

  const sortedDepartments = [...departments].sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'fastest') return a.avgSpeed - b.avgSpeed;
    if (sortBy === 'response') return b.responseRate - a.responseRate;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="scoreboard-page">
      {/* Header Section */}
      <section className="score-header">
        <div className="container">
          <div className="score-header-content">
            <h1 className="score-title">
              <span className="title-icon">🏛️</span> Government Transparency Scoreboard
            </h1>
            <p className="score-subtitle">
              Real-time accountability rankings of government departments based on RTI response rates, speed, and compliance. Powered by citizen data under RTI Act, 2005.
            </p>
          </div>
          
          <div className="score-stats-grid">
            <div className="score-stat-card">
              <h3>1,555</h3>
              <p>Total RTIs Filed</p>
            </div>
            <div className="score-stat-card">
              <h3>10</h3>
              <p>Departments Ranked</p>
            </div>
            <div className="score-stat-card">
              <h3>16.2</h3>
              <p>Avg Response (Days)</p>
            </div>
            <div className="score-stat-card penalty-stat">
              <h3>37</h3>
              <p>Penalties Imposed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="score-main">
        <div className="container">
          <div className="sort-controls">
            <label htmlFor="sort-select">Sort by:</label>
            <div className="select-wrapper">
              <select id="sort-select" value={sortBy} onChange={handleSort}>
                <option value="score">Transparency Score</option>
                <option value="fastest">Fastest Response</option>
                <option value="response">Response Rate</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="departments-list">
            {sortedDepartments.map((dept, index) => (
              <div key={index} className="department-card">
                <div className="dept-main-info">
                  <div className="dept-rank">
                    {dept.icon}
                  </div>
                  <div className="dept-details">
                    <h2>{dept.name}</h2>
                    <div className="dept-tags">
                      <span>📋 {dept.rtis} RTIs</span>
                      <span>✅ {dept.responseRate}% responded</span>
                      <span>⏱️ {dept.avgSpeed} days avg</span>
                      <span>⏰ {dept.onTime}% on-time</span>
                      {dept.penalties > 0 && <span className="warning-tag">⚠️ {dept.penalties} penalties</span>}
                    </div>
                  </div>
                  <div className="dept-score-badge">
                    <div className="score-value">{dept.score}</div>
                    <div className={`grade-badge grade-${dept.grade.charAt(0).toLowerCase()}`}>{dept.grade}</div>
                  </div>
                </div>

                <div className="dept-metrics-grid">
                  <div className="metric">
                    <span className="metric-label">Response Rate</span>
                    <span className="metric-value">{dept.responseRate}%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">On-Time Rate</span>
                    <span className="metric-value">{dept.onTime}%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Avg Speed</span>
                    <span className="metric-value">{dept.avgSpeed}d</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Penalties</span>
                    <span className={`metric-value ${dept.penalties > 0 ? 'text-danger' : 'text-success'}`}>{dept.penalties}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculation Info & CTA */}
      <section className="score-footer">
        <div className="container">
          <div className="calc-info-card">
            <h2>📊 How is the Transparency Score calculated?</h2>
            <p>
              Response Rate (30%) + On-Time Compliance (35%) + Speed Score (25%) + Penalty Deductions (10%). Scores are updated in real-time based on citizen-filed RTI data. Departments with 0 penalties get a bonus.
            </p>
          </div>
          
          <div className="score-cta">
            <h2>Hold your government accountable. File an RTI today.</h2>
            <div className="cta-buttons">
              <Link to="/submit-rti" className="btn btn-primary btn-large">File an RTI Request</Link>
              <Link to="/about" className="btn btn-outline btn-large">Learn More</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Scoreboard;
