import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../utils/api';
import { 
  FaHome, 
  FaUser, 
  FaSignOutAlt, 
  FaBars,
  FaTimes,
  FaBell,
  FaTachometerAlt,
  FaFileAlt,
  FaClipboardList,
  FaUsers,
  FaBuilding,
  FaChartBar,
  FaStar,
  FaInfoCircle,
  FaTrophy
} from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, logout, isCitizen, isPIO, isAppellate, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsAPI.getAll({ limit: 5, unreadOnly: true });
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin';
    if (isPIO) return '/pio-dashboard';
    if (isAppellate) return '/appeal-dashboard';
    return '/dashboard';
  };

  const navLinks = [
    { to: '/', icon: <FaHome />, label: 'Home', public: true },
    { to: '/scoreboard', icon: <FaTrophy />, label: 'Scoreboard', public: true },
    { to: '/about', icon: <FaInfoCircle />, label: 'About us', public: true },
    { to: '/#features', icon: <FaStar />, label: 'Features', public: true },
    { to: '/#how-it-works', icon: <FaInfoCircle />, label: 'How It Works', public: true },
    { to: '/transparency', icon: <FaChartBar />, label: 'Transparency', public: true },
    { to: getDashboardLink(), icon: <FaTachometerAlt />, label: 'Dashboard', private: true },
    { to: '/submit-rti', icon: <FaFileAlt />, label: 'Submit RTI', citizen: true },
    { to: '/my-requests', icon: <FaClipboardList />, label: 'My Requests', citizen: true },
    { to: '/pio-requests', icon: <FaClipboardList />, label: 'Requests', pio: true },
    { to: '/admin/users', icon: <FaUsers />, label: 'Users', admin: true },
    { to: '/admin/departments', icon: <FaBuilding />, label: 'Departments', admin: true },
    { to: '/admin/analytics', icon: <FaChartBar />, label: 'Analytics', admin: true },
    { to: '/profile', icon: <FaUser />, label: 'Profile', private: true },
  ];

  const filteredLinks = navLinks.filter(link => {
    if (link.public) return true;
    if (!isAuthenticated) return false;
    if (link.private) return true;
    if (link.citizen && isCitizen) return true;
    if (link.pio && isPIO) return true;
    if (link.appellate && isAppellate) return true;
    if (link.admin && isAdmin) return true;
    return false;
  });

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setIsOpen(false)}>
          <span className="logo-icon">📋</span>
          <span className="logo-text">RTI Connect</span>
        </Link>

        <div className="navbar-right">
          {isAuthenticated && (
            <div className="notifications-dropdown">
              <button 
                className="notification-btn"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FaBell />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
              
              {showNotifications && (
                <div className="notification-menu">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                    {notifications.length > 0 && (
                      <button 
                        className="mark-all-read"
                        onClick={async () => {
                          await notificationsAPI.markAllRead();
                          fetchNotifications();
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <p className="no-notifications">No new notifications</p>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif._id} 
                          className="notification-item"
                          onClick={() => {
                            markAsRead(notif._id);
                            if (notif.data?.actionUrl) {
                              navigate(notif.data.actionUrl);
                              setShowNotifications(false);
                            }
                          }}
                        >
                          <div className="notification-content">
                            <h4>{notif.title}</h4>
                            <p>{notif.message}</p>
                            <span className="notification-time">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {!notif.isRead && <span className="unread-dot"></span>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <button 
            className="mobile-menu-btn"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
          {filteredLinks.map((link, index) => {
            if (link.to.startsWith('/#')) {
              return (
                <a
                  key={index}
                  href={link.to}
                  className="nav-link"
                  onClick={() => setIsOpen(false)}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </a>
              );
            }
            return (
              <Link
                key={index}
                to={link.to}
                className="nav-link"
                onClick={() => setIsOpen(false)}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}

          {isAuthenticated ? (
            <button onClick={handleLogout} className="nav-link logout-btn">
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', marginLeft: '1rem' }}>
              <Link to="/login" className="btn btn-outline" onClick={() => setIsOpen(false)}>
                <span>Sign In</span>
              </Link>
              <Link to="/register" className="btn btn-primary" onClick={() => setIsOpen(false)}>
                <span>Get Started</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;