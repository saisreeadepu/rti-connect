import React, { useState, useEffect } from 'react';
import { 
  FaCog, 
  FaBell, 
  FaLanguage, 
  FaPalette,
  FaSave,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaDatabase
} from 'react-icons/fa';
import Loader from '../components/Loader';
import './SystemSettings.css';
import toast from 'react-hot-toast';

const SystemSettings = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      siteName: 'RTI Connect',
      siteUrl: 'http://localhost:3000',
      supportEmail: 'support@rticonnect.gov.in',
      supportPhone: '1800-123-4567',
      contactAddress: 'Secretariat, Hyderabad, Telangana - 500001'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      rtiSubmitted: true,
      rtiStatusUpdate: true,
      rtiResponse: true,
      appealFiled: true,
      appealDecision: true,
      deadlineReminder: true,
      systemAlerts: true
    },
    localization: {
      defaultLanguage: 'en',
      enableMultiLanguage: true,
      languages: ['en', 'te', 'hi'],
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h'
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      maxLoginAttempts: 5,
      requireStrongPassword: true
    },
    fees: {
      rtiFee: 10,
      appealFee: 0,
      paymentGateway: 'razorpay',
      enableOnlinePayment: true
    },
    appearance: {
      theme: 'light',
      primaryColor: '#2563eb',
      logo: '/logo.png',
      favicon: '/favicon.ico'
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // In a real app, fetch from API
      // const response = await settingsAPI.get();
      // setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleCheckboxChange = (section, field) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: !prev[section][field]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      // In a real app, save to API
      // await settingsAPI.update(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: <FaCog /> },
    { id: 'notifications', name: 'Notifications', icon: <FaBell /> },
    { id: 'localization', name: 'Localization', icon: <FaLanguage /> },
    { id: 'security', name: 'Security', icon: <FaLock /> },
    { id: 'fees', name: 'Fees & Payment', icon: <FaDatabase /> },
    { id: 'appearance', name: 'Appearance', icon: <FaPalette /> }
  ];

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="system-settings-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            <FaCog /> System Settings
          </h1>
          <p className="page-subtitle">
            Configure and manage system-wide settings
          </p>
        </div>

        <div className="settings-container">
          {/* Sidebar */}
          <div className="settings-sidebar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="settings-content">
            <form onSubmit={handleSubmit}>
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="settings-section">
                  <h3>General Settings</h3>
                  
                  <div className="form-group">
                    <label>Site Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={settings.general.siteName}
                      onChange={(e) => handleChange('general', 'siteName', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Site URL</label>
                    <input
                      type="url"
                      className="form-control"
                      value={settings.general.siteUrl}
                      onChange={(e) => handleChange('general', 'siteUrl', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Support Email</label>
                    <div className="input-with-icon">
                      <FaEnvelope className="input-icon" />
                      <input
                        type="email"
                        className="form-control"
                        value={settings.general.supportEmail}
                        onChange={(e) => handleChange('general', 'supportEmail', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Support Phone</label>
                    <div className="input-with-icon">
                      <FaPhone className="input-icon" />
                      <input
                        type="text"
                        className="form-control"
                        value={settings.general.supportPhone}
                        onChange={(e) => handleChange('general', 'supportPhone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Contact Address</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={settings.general.contactAddress}
                      onChange={(e) => handleChange('general', 'contactAddress', e.target.value)}
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="settings-section">
                  <h3>Notification Settings</h3>
                  
                  <div className="settings-group">
                    <h4>Delivery Methods</h4>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={settings.notifications.emailNotifications}
                          onChange={() => handleCheckboxChange('notifications', 'emailNotifications')}
                        />
                        Enable Email Notifications
                      </label>
                      
                      <label>
                        <input
                          type="checkbox"
                          checked={settings.notifications.smsNotifications}
                          onChange={() => handleCheckboxChange('notifications', 'smsNotifications')}
                        />
                        Enable SMS Notifications
                      </label>
                    </div>
                  </div>

                  <div className="settings-group">
                    <h4>Notification Types</h4>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={settings.notifications.rtiSubmitted}
                          onChange={() => handleCheckboxChange('notifications', 'rtiSubmitted')}
                        />
                        RTI Submitted
                      </label>
                      
                      <label>
                        <input
                          type="checkbox"
                          checked={settings.notifications.rtiStatusUpdate}
                          onChange={() => handleCheckboxChange('notifications', 'rtiStatusUpdate')}
                        />
                        Status Updates
                      </label>
                      
                      <label>
                        <input
                          type="checkbox"
                          checked={settings.notifications.rtiResponse}
                          onChange={() => handleCheckboxChange('notifications', 'rtiResponse')}
                        />
                        Response Received
                      </label>
                      
                      <label>
                        <input
                          type="checkbox"
                          checked={settings.notifications.appealFiled}
                          onChange={() => handleCheckboxChange('notifications', 'appealFiled')}
                        />
                        Appeal Filed
                      </label>
                      
                      <label>
                        <input
                          type="checkbox"
                          checked={settings.notifications.appealDecision}
                          onChange={() => handleCheckboxChange('notifications', 'appealDecision')}
                        />
                        Appeal Decision
                      </label>
                      
                      <label>
                        <input
                          type="checkbox"
                          checked={settings.notifications.deadlineReminder}
                          onChange={() => handleCheckboxChange('notifications', 'deadlineReminder')}
                        />
                        Deadline Reminders
                      </label>
                      
                      <label>
                        <input
                          type="checkbox"
                          checked={settings.notifications.systemAlerts}
                          onChange={() => handleCheckboxChange('notifications', 'systemAlerts')}
                        />
                        System Alerts
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Localization Settings */}
              {activeTab === 'localization' && (
                <div className="settings-section">
                  <h3>Localization Settings</h3>
                  
                  <div className="form-group">
                    <label>Default Language</label>
                    <select
                      className="form-control"
                      value={settings.localization.defaultLanguage}
                      onChange={(e) => handleChange('localization', 'defaultLanguage', e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="te">తెలుగు</option>
                      <option value="hi">हिन्दी</option>
                    </select>
                  </div>

                  <div className="checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.localization.enableMultiLanguage}
                        onChange={() => handleCheckboxChange('localization', 'enableMultiLanguage')}
                      />
                      Enable Multi-language Support
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Date Format</label>
                    <select
                      className="form-control"
                      value={settings.localization.dateFormat}
                      onChange={(e) => handleChange('localization', 'dateFormat', e.target.value)}
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Time Format</label>
                    <select
                      className="form-control"
                      value={settings.localization.timeFormat}
                      onChange={(e) => handleChange('localization', 'timeFormat', e.target.value)}
                    >
                      <option value="24h">24-hour format</option>
                      <option value="12h">12-hour format</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="settings-section">
                  <h3>Security Settings</h3>
                  
                  <div className="checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactorAuth}
                        onChange={() => handleCheckboxChange('security', 'twoFactorAuth')}
                      />
                      Enable Two-Factor Authentication
                    </label>
                    
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.security.requireStrongPassword}
                        onChange={() => handleCheckboxChange('security', 'requireStrongPassword')}
                      />
                      Require Strong Passwords
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Session Timeout (minutes)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
                      min="5"
                      max="120"
                    />
                  </div>

                  <div className="form-group">
                    <label>Password Expiry (days)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={settings.security.passwordExpiry}
                      onChange={(e) => handleChange('security', 'passwordExpiry', parseInt(e.target.value))}
                      min="30"
                      max="365"
                    />
                  </div>

                  <div className="form-group">
                    <label>Max Login Attempts</label>
                    <input
                      type="number"
                      className="form-control"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => handleChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                      min="3"
                      max="10"
                    />
                  </div>
                </div>
              )}

              {/* Fees & Payment Settings */}
              {activeTab === 'fees' && (
                <div className="settings-section">
                  <h3>Fees & Payment Settings</h3>
                  
                  <div className="checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.fees.enableOnlinePayment}
                        onChange={() => handleCheckboxChange('fees', 'enableOnlinePayment')}
                      />
                      Enable Online Payment
                    </label>
                  </div>

                  <div className="form-group">
                    <label>RTI Application Fee (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={settings.fees.rtiFee}
                      onChange={(e) => handleChange('fees', 'rtiFee', parseInt(e.target.value))}
                      min="0"
                      step="5"
                    />
                  </div>

                  <div className="form-group">
                    <label>Appeal Filing Fee (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={settings.fees.appealFee}
                      onChange={(e) => handleChange('fees', 'appealFee', parseInt(e.target.value))}
                      min="0"
                      step="5"
                    />
                  </div>

                  <div className="form-group">
                    <label>Payment Gateway</label>
                    <select
                      className="form-control"
                      value={settings.fees.paymentGateway}
                      onChange={(e) => handleChange('fees', 'paymentGateway', e.target.value)}
                    >
                      <option value="razorpay">Razorpay</option>
                      <option value="paytm">Paytm</option>
                      <option value="payu">PayU</option>
                      <option value="ccavenue">CCAvenue</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div className="settings-section">
                  <h3>Appearance Settings</h3>
                  
                  <div className="form-group">
                    <label>Theme</label>
                    <select
                      className="form-control"
                      value={settings.appearance.theme}
                      onChange={(e) => handleChange('appearance', 'theme', e.target.value)}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Primary Color</label>
                    <div className="color-picker">
                      <input
                        type="color"
                        value={settings.appearance.primaryColor}
                        onChange={(e) => handleChange('appearance', 'primaryColor', e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-control"
                        value={settings.appearance.primaryColor}
                        onChange={(e) => handleChange('appearance', 'primaryColor', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Logo URL</label>
                    <input
                      type="text"
                      className="form-control"
                      value={settings.appearance.logo}
                      onChange={(e) => handleChange('appearance', 'logo', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Favicon URL</label>
                    <input
                      type="text"
                      className="form-control"
                      value={settings.appearance.favicon}
                      onChange={(e) => handleChange('appearance', 'favicon', e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <Loader size="small" /> : <><FaSave /> Save Settings</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;