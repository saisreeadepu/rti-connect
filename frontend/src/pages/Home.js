import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaFileAlt, 
  FaSearch, 
  FaBell, 
  FaChartBar, 
  FaShieldAlt, 
  FaClock, 
  FaUserPlus, 
  FaMoneyBillWave, 
  FaCheckCircle,
  FaLandmark,
  FaFolderOpen,
  FaHourglassHalf,
  FaGavel,
  FaTimesCircle,
  FaInfoCircle
} from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Feature boxes configuration
  const features = [
    {
      icon: <FaFileAlt />,
      title: 'Easy RTI Filing',
      description: 'Submit RTI applications online with our guided form and smart templates',
      action: () => {
        if (isAuthenticated) {
          navigate('/submit-rti');
        } else {
          navigate('/register');
        }
      },
      linkText: isAuthenticated ? 'File RTI Now →' : 'Register to File →'
    },
    {
      icon: <FaSearch />,
      title: 'Smart Department Finder',
      description: 'AI-powered recommendations to find the right department for your query',
      action: () => {
        if (isAuthenticated) {
          navigate('/submit-rti');
        } else {
          navigate('/register');
        }
      },
      linkText: isAuthenticated ? 'Try Smart Finder →' : 'Register to Use →'
    },
    {
      icon: <FaClock />,
      title: 'Real-time Tracking',
      description: 'Track your application status anytime, anywhere',
      action: () => {
        if (isAuthenticated) {
          navigate('/my-requests');
        } else {
          navigate('/track');
        }
      },
      linkText: isAuthenticated ? 'Track Your Requests →' : 'Track Now →'
    },
    {
      icon: <FaBell />,
      title: 'Instant Notifications',
      description: 'Get email and SMS alerts for status updates',
      action: () => {
        if (isAuthenticated) {
          navigate('/profile');
        } else {
          navigate('/register');
        }
      },
      linkText: isAuthenticated ? 'Manage Notifications →' : 'Register for Alerts →'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Secure & Transparent',
      description: 'Your data is secure with end-to-end encryption',
      action: () => {
        navigate('/about');
      },
      linkText: 'Learn More →'
    },
    {
      icon: <FaChartBar />,
      title: 'Analytics Dashboard',
      description: 'View statistics and insights about RTI processing',
      action: () => {
        if (isAuthenticated) {
          navigate('/analytics');
        } else {
          navigate('/register');
        }
      },
      linkText: isAuthenticated ? 'View Analytics →' : 'Register to View →'
    }
  ];

  // Stats configuration
  const stats = [
    { value: '10,000+', label: 'Applications Filed' },
    { value: '50+', label: 'Government Departments' },
    { value: '95%', label: 'Satisfaction Rate' },
    { value: '30 Days', label: 'Average Response Time' }
  ];

  // Four step boxes configuration
  const steps = [
    {
      number: '1',
      title: 'Register/Login',
      description: 'Create an account or login to your existing account',
      icon: <FaUserPlus />,
      actionText: 'Create Account →',
      action: () => {
        if (isAuthenticated) {
          navigate('/dashboard');
        } else {
          navigate('/register');
        }
      }
    },
    {
      number: '2',
      title: 'Fill RTI Form',
      description: 'Use our smart form with department recommendations',
      icon: <FaFileAlt />,
      actionText: 'Login to File →',
      action: () => {
        if (isAuthenticated) {
          navigate('/submit-rti');
        } else {
          navigate('/login');
        }
      }
    },
    {
      number: '3',
      title: 'Pay Fee',
      description: 'Pay the nominal fee of ₹10 online',
      icon: <FaMoneyBillWave />,
      actionText: 'Login to Pay →',
      action: () => {
        if (isAuthenticated) {
          navigate('/my-requests');
        } else {
          navigate('/login');
        }
      }
    },
    {
      number: '4',
      title: 'Track Status',
      description: 'Get real-time updates on your application',
      icon: <FaCheckCircle />,
      actionText: 'Track Now →',
      action: () => {
        if (isAuthenticated) {
          navigate('/my-requests');
        } else {
          navigate('/track');
        }
      }
    }
  ];

  // Testimonials configuration
  const testimonials = [
    {
      quote: "The process was so simple! I filed my RTI in just 10 minutes and got the response within 25 days.",
      author: "Rajesh Kumar",
      role: "Citizen, Hyderabad",
      avatar: "RK"
    },
    {
      quote: "The department recommendation feature saved me from sending my request to the wrong department.",
      author: "Sunita Patel",
      role: "RTI Activist, Mumbai",
      avatar: "SP"
    },
    {
      quote: "I could track my application status in real-time. Very transparent and user-friendly platform.",
      author: "Arjun Mehta",
      role: "Journalist, Delhi",
      avatar: "AM"
    }
  ];

  // Common RTI Issues - 3 boxes
  const issues = [
    {
      id: 1,
      icon: <FaLandmark />,
      title: 'Land Issues',
      description: 'Problems related to land records, ownership disputes, and property documents',
      details: {
        problem: 'Citizens face difficulties in accessing land records, mutation entries, and property documents from revenue departments.',
        examples: [
          'Land records not updated after purchase',
          'Disputes over land ownership',
          'Missing mutation entries',
          'Incorrect survey numbers',
          'Encroachment on government land'
        ],
        solution: 'File RTI to get certified copies of land records, mutation registers, and revenue maps. Our platform helps you draft precise questions for land-related queries.',
        stats: '30% of all RTIs filed are related to land and property issues'
      }
    },
    {
      id: 2,
      icon: <FaFolderOpen />,
      title: 'Missing Files',
      description: 'Government files, documents, and records that cannot be traced',
      details: {
        problem: 'Important government files, service records, and official documents often go missing, causing delays in pensions, promotions, and benefits.',
        examples: [
          'Service books of employees lost',
          'Pension papers missing',
          'Educational certificates not traceable',
          'Case files lost in courts',
          'Project files disappeared'
        ],
        solution: 'RTI can be used to track missing files, inquire about the last known location, and hold officers accountable for record-keeping.',
        stats: 'Over 15,000 RTIs filed annually for missing government files'
      }
    },
    {
      id: 3,
      icon: <FaHourglassHalf />,
      title: 'Delayed Responses',
      description: 'PIOs not responding within the mandated 30-day period',
      details: {
        problem: 'Public Information Officers (PIOs) frequently delay responses beyond the statutory 30-day limit, defeating the purpose of RTI.',
        examples: [
          'No response after 30 days',
          'Incomplete information provided',
          'Request transferred without intimation',
          'False claims of file not traceable',
          'Deliberate obstruction by officials'
        ],
        solution: 'First Appeal to Appellate Authority within 30 days of deemed refusal. Our platform helps you file appeals automatically for delayed responses.',
        stats: '40% of RTI applications face delays beyond 30 days'
      }
    }
  ];

  // Handler functions
  const handleFeatureClick = (feature) => {
    feature.action();
  };

  const handleStepClick = (step) => {
    step.action();
  };

  const handleIssueClick = (issue) => {
    setSelectedIssue(issue);
  };

  const handleTestimonialClick = (testimonial) => {
    // You can customize this action
    // For example, navigate to a page with more testimonials
    console.log('Testimonial clicked:', testimonial.author);
    // navigate('/testimonials');
  };

  const closeModal = () => {
    setSelectedIssue(null);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section" style={{ backgroundImage: `url('/images/homepage%20banner.jpg.jpeg')` }}>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              <span style={{ color: 'var(--primary-color)' }}>Democratizing Information for</span> <span className="highlight">Every Citizen</span>
            </h1>
            <p className="hero-subtitle" style={{ color: 'var(--secondary-color)', fontWeight: '600' }}>
              A modern digital platform to exercise your Right to Information. 
              File online, track in real-time, and hold authorities accountable.
            </p>
            <div className="hero-buttons">
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="btn btn-outline-light btn-large">
                    Get Started — It's Free
                  </Link>
                  <a href="#how-it-works" className="btn btn-large" style={{ background: 'transparent', border: '2px solid var(--dark-color)', color: 'var(--dark-color)' }}>
                    How It Works
                  </a>
                </>
              ) : (
                <Link to="/dashboard" className="btn btn-primary btn-large">
                  Go to Dashboard
                </Link>
              )}
            </div>
            <div className="hero-stats">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="stat-item glass-stat"
                  onClick={() => navigate(isAuthenticated ? '/analytics' : '/register')}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') navigate(isAuthenticated ? '/analytics' : '/register');
                  }}
                  title="Click to view detailed analytics"
                >
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - 6 Clickable Boxes */}
      <section id="features" className="features-section">
        <div className="container">
          <h2 className="section-title">Platform Features</h2>
          <p className="section-subtitle">
            Everything You Need for RTI
          </p>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card clickable"
                onClick={() => handleFeatureClick(feature)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleFeatureClick(feature);
                  }
                }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-footer">
                  <span className="feature-link">{feature.linkText}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Common RTI Issues Section - 3 Clickable Boxes */}
      
       <section className="issues-section">
        <div className="container">
          <h2 className="section-title">Common RTI Issues Faced by Citizens</h2>
          <p className="section-subtitle">
            Click on each issue to learn more and find solutions
          </p>
          <div className="issues-grid">
            {issues.map((issue) => (
              <div 
                key={issue.id} 
                className="issue-card clickable"
                onClick={() => handleIssueClick(issue)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleIssueClick(issue);
                  }
                }}
              >
                <div className="issue-icon">{issue.icon}</div>
                <h3 className="issue-title">{issue.title}</h3>
                <p className="issue-description">{issue.description}</p>
                <div className="issue-footer">
                  <span className="issue-link">Click to Learn More →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
  
      {/* How It Works Section - 4 Clickable Step Boxes */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            4 Simple Steps to File RTI
          </p>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="step-card clickable"
                onClick={() => handleStepClick(step)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleStepClick(step);
                  }
                }}
              >
                <div className="step-number">{step.number}</div>
                <div className="step-icon">{step.icon}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
                <div className="step-footer">
                  <span className="step-link">
                    {step.actionText}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content glass-panel" style={{ padding: '3rem', borderRadius: 'var(--radius-xl)' }}>
            <h2 className="cta-title" style={{ color: 'var(--text-primary)' }}>Ready to file your RTI?</h2>
            <p className="cta-subtitle" style={{ color: 'var(--text-secondary)' }}>
              Join thousands of citizens who have successfully filed RTI applications through our platform
            </p>
            {!isAuthenticated ? (
              <Link to="/register" className="btn btn-primary btn-large">
                Create Free Account
              </Link>
            ) : (
              <Link to="/submit-rti" className="btn btn-primary btn-large">
                Submit RTI Application
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Section - 3 Clickable Boxes */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title">What Our Users Say</h2>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="testimonial-card clickable"
                onClick={() => handleTestimonialClick(testimonial)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleTestimonialClick(testimonial);
                  }
                }}
              >
                <div className="testimonial-content">
                  "{testimonial.quote}"
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">{testimonial.avatar}</div>
                  <div className="author-info">
                    <h4>{testimonial.author}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
                <div className="testimonial-footer">
                  <span className="testimonial-link">Read More →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Issue Details Modal */}
      {selectedIssue && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            
            <div className="modal-header">
              <div className="modal-icon">{selectedIssue.icon}</div>
              <h2>{selectedIssue.title}</h2>
            </div>

            <div className="modal-body">
              <div className="issue-section">
                <h3>
                  <FaInfoCircle /> The Problem
                </h3>
                <p>{selectedIssue.details.problem}</p>
              </div>

              <div className="issue-section">
                <h3>
                  <FaTimesCircle /> Common Examples
                </h3>
                <ul className="issue-list">
                  {selectedIssue.details.examples.map((example, index) => (
                    <li key={index}>{example}</li>
                  ))}
                </ul>
              </div>

              <div className="issue-section highlight">
                <h3>
                  <FaGavel /> How RTI Can Help
                </h3>
                <p>{selectedIssue.details.solution}</p>
              </div>

              <div className="issue-stats">
                <div className="stat-badge">
                  {selectedIssue.details.stats}
                </div>
              </div>

              <div className="modal-actions">
                {!isAuthenticated ? (
                  <Link to="/register" className="btn btn-primary" onClick={closeModal}>
                    Register to File RTI
                  </Link>
                ) : (
                  <Link to="/submit-rti" className="btn btn-primary" onClick={closeModal}>
                    File RTI for This Issue
                  </Link>
                )}
                <button className="btn btn-outline" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;