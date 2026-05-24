import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { departmentsAPI } from '../utils/api';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaPhone, 
  FaEye,
  FaEyeSlash,
  FaBuilding,
  FaArrowLeft
} from 'react-icons/fa';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'citizen',
    department: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await departmentsAPI.getAll();
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@gmail\.com$/i.test(formData.email)) {
      newErrors.email = 'Only @gmail.com email addresses are allowed';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian phone number';
    }
    
    // Department validation for PIO/Appellate
    if ((formData.role === 'pio' || formData.role === 'appellate') && !formData.department) {
      newErrors.department = 'Department is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    // Remove confirmPassword before sending
    const { confirmPassword, ...registerData } = formData;
    
    const result = await register(registerData);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card register-card">
          <div className="auth-info-panel hide-on-mobile">
            <h2 style={{fontSize: '2.5rem', marginBottom: '1rem'}}>Join the Transparency Movement</h2>
            <p style={{fontSize: '1.1rem', opacity: '0.9', lineHeight: '1.6'}}>
              Create a free account to file RTIs with any government department digitally without the paperwork hassle.
            </p>
            <div style={{marginTop: '3rem'}}>
              <div style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center'}}>
                <span style={{background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✓</span>
                <span style={{fontSize: '1.05rem'}}>Smart Department Finder AI</span>
              </div>
              <div style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center'}}>
                <span style={{background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✓</span>
                <span style={{fontSize: '1.05rem'}}>Guided Application Steps</span>
              </div>
              <div style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center'}}>
                <span style={{background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✓</span>
                <span style={{fontSize: '1.05rem'}}>Automated Reminders & Appeals</span>
              </div>
            </div>
          </div>
          
          <div className="auth-form-panel">
            <div className="auth-header" style={{ position: 'relative' }}>
              <Link to="/" style={{ position: 'absolute', top: '-1rem', right: '0', fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaArrowLeft /> Back to home
              </Link>
            <h2>Create Account</h2>
            <p>Join RTI Connect to file and track RTI applications</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-group">
                  <span className="input-icon">
                    <FaUser />
                  </span>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>

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
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-group">
                  <span className="input-icon">
                    <FaLock />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="Create a password"
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

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-group">
                  <span className="input-icon">
                    <FaLock />
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <div className="input-group">
                  <span className="input-icon">
                    <FaPhone />
                  </span>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="role">I am a</label>
                <select
                  id="role"
                  name="role"
                  className="form-control"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="citizen">Citizen</option>
                  <option value="pio">Public Information Officer (PIO)</option>
                  <option value="appellate">Appellate Authority</option>
                </select>
              </div>
            </div>

            {(formData.role === 'pio' || formData.role === 'appellate') && (
              <div className="form-group">
                <label htmlFor="department">Department</label>
                <div className="input-group">
                  <span className="input-icon">
                    <FaBuilding />
                  </span>
                  <select
                    id="department"
                    name="department"
                    className={`form-control ${errors.department ? 'is-invalid' : ''}`}
                    value={formData.department}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                {errors.department && <div className="invalid-feedback">{errors.department}</div>}
              </div>
            )}

            <div className="form-group">
              <label>Address (Optional)</label>
              <div className="address-fields">
                <input
                  type="text"
                  name="address.street"
                  className="form-control"
                  placeholder="Street Address"
                  value={formData.address.street}
                  onChange={handleChange}
                  disabled={loading}
                />
                <div className="form-row">
                  <input
                    type="text"
                    name="address.city"
                    className="form-control"
                    placeholder="City"
                    value={formData.address.city}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <input
                    type="text"
                    name="address.state"
                    className="form-control"
                    placeholder="State"
                    value={formData.address.state}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                <input
                  type="text"
                  name="address.pincode"
                  className="form-control"
                  placeholder="Pincode"
                  value={formData.address.pincode}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group terms">
              <label className="checkbox-label">
                <input type="checkbox" required /> 
                I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
              </label>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;