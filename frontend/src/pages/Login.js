
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, sendOtp, verifyOtp } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: ''
  });
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (loginMethod === 'password') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      }
    } else {
      if (otpSent && !formData.otp) {
        newErrors.otp = 'OTP is required';
      } else if (otpSent && formData.otp.length !== 6) {
        newErrors.otp = 'OTP must be 6 digits';
      }
    }
    
    return newErrors;
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      setErrors({ ...errors, email: 'Email is required to send OTP' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors({ ...errors, email: 'Email is invalid' });
      return;
    }

    setLoading(true);
    const result = await sendOtp(formData.email);
    setLoading(false);

    if (result.success) {
      setOtpSent(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    let result;
    if (loginMethod === 'password') {
      result = await login(formData.email, formData.password);
    } else {
      if (!otpSent) {
        // Should not happen, but just in case
        setLoading(false);
        return;
      }
      result = await verifyOtp(formData.email, formData.otp);
    }
    
    setLoading(false);

    if (result.success) {
      // Redirect based on role
      switch (result.user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'pio':
          navigate('/pio-dashboard');
          break;
        case 'appellate':
          navigate('/appeal-dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-info-panel hide-on-mobile">
            <h2 style={{fontSize: '2.5rem', marginBottom: '1rem'}}>Welcome back to <br/>RTI Connect</h2>
            <p style={{fontSize: '1.1rem', opacity: '0.9', lineHeight: '1.6'}}>
              Securely login to track your RTI applications, respond to queries, and enforce transparency.
            </p>
            <div style={{marginTop: '3rem'}}>
              <div style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center'}}>
                <span style={{background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✓</span>
                <span style={{fontSize: '1.05rem'}}>End-to-end encrypted</span>
              </div>
              <div style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center'}}>
                <span style={{background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✓</span>
                <span style={{fontSize: '1.05rem'}}>Real-time application status</span>
              </div>
              <div style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center'}}>
                <span style={{background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✓</span>
                <span style={{fontSize: '1.05rem'}}>Direct portal access for PIOs</span>
              </div>
            </div>
          </div>
          
          <div className="auth-form-panel">
            <div className="auth-header" style={{ position: 'relative' }}>
              <Link to="/" style={{ position: 'absolute', top: '-1rem', right: '0', fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaArrowLeft /> Back to home
              </Link>
              <h2>Welcome back</h2>
              <p>Sign in to access your RTI portal</p>
            </div>



          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-group">
                <span className="input-icon">
                  <FaEnvelope />
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading || (loginMethod === 'otp' && otpSent)}
                />
              </div>
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            {loginMethod === 'password' ? (
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
                  <Link to="/forgot-password" style={{ fontSize: '0.875rem', color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>
                    Forgot password?
                  </Link>
                </div>
                <div className="input-group">
                  <span className="input-icon">
                    <FaLock />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>
            ) : (
              <div className="form-group">
                {otpSent ? (
                  <>
                    <label htmlFor="otp">Enter 6-digit OTP</label>
                    <div className="input-group">
                      <span className="input-icon">
                        <FaLock />
                      </span>
                      <input
                        type="text"
                        id="otp"
                        name="otp"
                        maxLength="6"
                        className={`form-control ${errors.otp ? 'is-invalid' : ''}`}
                        placeholder="000000"
                        value={formData.otp}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                    {errors.otp && <div className="invalid-feedback">{errors.otp}</div>}
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    disabled={loading}
                    onClick={handleSendOtp}
                  >
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                )}
              </div>
            )}

            {(!loginMethod || loginMethod === 'password' || (loginMethod === 'otp' && otpSent)) && (
              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            )}
          </form>

          <div className="auth-footer" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              New citizen? <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>Register here</Link>
            </p>
          </div>

          <div className="demo-access-container" style={{ marginTop: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
              <span style={{ padding: '0 1rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>Quick Demo Access</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => { setFormData({ ...formData, email: 'citizen@example.com', password: 'password123' }); setLoginMethod('password'); }} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}>
                <span>👤</span> Citizen
              </button>
              <button type="button" onClick={() => { setFormData({ ...formData, email: 'pio@example.com', password: 'password123' }); setLoginMethod('password'); }} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}>
                <span>🏛️</span> PIO
              </button>
              <button type="button" onClick={() => { setFormData({ ...formData, email: 'admin@example.com', password: 'admin123' }); setLoginMethod('password'); }} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}>
                <span>🔧</span> CIO
              </button>
              <button type="button" onClick={() => { setFormData({ ...formData, email: 'appellate@example.com', password: 'password123' }); setLoginMethod('password'); }} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}>
                <span>⚖️</span> Appellate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Login;