import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../utils/api';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaBuilding,
  FaLanguage,
  FaSave,
  FaEdit,
  FaKey
} from 'react-icons/fa';
import Loader from '../components/Loader';
import './Profile.css';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    language: 'en'
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          pincode: ''
        },
        language: user.language || 'en'
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setProfileData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateProfile = () => {
    const newErrors = {};
    
    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!profileData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(profileData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }
    
    return newErrors;
  };

  const validatePassword = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateProfile();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const response = await userAPI.updateProfile(profileData);
      updateUser(response.data.user);
      toast.success('Profile updated successfully');
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validatePassword();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      await userAPI.changePassword(passwordData);
      toast.success('Password changed successfully');
      setChangePassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Loader fullScreen />;
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1 className="profile-title">
            <FaUser /> My Profile
          </h1>
          {!editMode && !changePassword && (
            <div className="profile-actions">
              <button 
                className="btn btn-outline-primary"
                onClick={() => setEditMode(true)}
              >
                <FaEdit /> Edit Profile
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => setChangePassword(true)}
              >
                <FaKey /> Change Password
              </button>
            </div>
          )}
        </div>

        <div className="profile-grid">
          {/* Profile Information */}
          <div className="profile-card">
            <h3>Personal Information</h3>
            
            {!editMode ? (
              <div className="profile-info">
                <div className="info-row">
                  <FaUser className="info-icon" />
                  <div>
                    <label>Full Name</label>
                    <p>{user.name}</p>
                  </div>
                </div>
                
                <div className="info-row">
                  <FaEnvelope className="info-icon" />
                  <div>
                    <label>Email Address</label>
                    <p>{user.email}</p>
                  </div>
                </div>
                
                <div className="info-row">
                  <FaPhone className="info-icon" />
                  <div>
                    <label>Phone Number</label>
                    <p>{user.phone}</p>
                  </div>
                </div>
                
                <div className="info-row">
                  <FaBuilding className="info-icon" />
                  <div>
                    <label>Role</label>
                    <p className="role-badge">{user.role}</p>
                  </div>
                </div>
                
                {user.department && (
                  <div className="info-row">
                    <FaBuilding className="info-icon" />
                    <div>
                      <label>Department</label>
                      <p>{user.department}</p>
                    </div>
                  </div>
                )}
                
                <div className="info-row">
                  <FaLanguage className="info-icon" />
                  <div>
                    <label>Preferred Language</label>
                    <p>{user.language === 'en' ? 'English' : user.language === 'te' ? 'తెలుగు' : 'हिन्दी'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    value={profileData.name}
                    onChange={handleChange}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={profileData.email}
                    disabled
                  />
                  <small className="form-text">Email cannot be changed</small>
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                    value={profileData.phone}
                    onChange={handleChange}
                  />
                  {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                </div>

                <div className="form-group">
                  <label>Preferred Language</label>
                  <select
                    name="language"
                    className="form-control"
                    value={profileData.language}
                    onChange={handleChange}
                  >
                    <option value="en">English</option>
                    <option value="te">తెలుగు</option>
                    <option value="hi">हिन्दी</option>
                  </select>
                </div>

                <h4>Address</h4>
                
                <div className="form-group">
                  <label>Street Address</label>
                  <input
                    type="text"
                    name="address.street"
                    className="form-control"
                    value={profileData.address.street}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="address.city"
                      className="form-control"
                      value={profileData.address.city}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      name="address.state"
                      className="form-control"
                      value={profileData.address.state}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    name="address.pincode"
                    className="form-control"
                    value={profileData.address.pincode}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? <Loader size="small" /> : <><FaSave /> Save Changes</>}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Account Information */}
          <div className="profile-card">
            <h3>Account Information</h3>
            
            <div className="account-info">
              <div className="info-row">
                <label>Account Created</label>
                <p>{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div className="info-row">
                <label>Last Login</label>
                <p>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</p>
              </div>
              
              <div className="info-row">
                <label>Account Status</label>
                <p className="status-active">Active</p>
              </div>
            </div>

            {!changePassword ? (
              <button 
                className="btn btn-outline-secondary btn-block"
                onClick={() => setChangePassword(true)}
              >
                <FaKey /> Change Password
              </button>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="password-form">
                <h4>Change Password</h4>
                
                <div className="form-group">
                  <label>Current Password *</label>
                  <input
                    type="password"
                    name="currentPassword"
                    className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                  />
                  {errors.currentPassword && <div className="invalid-feedback">{errors.currentPassword}</div>}
                </div>

                <div className="form-group">
                  <label>New Password *</label>
                  <input
                    type="password"
                    name="newPassword"
                    className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />
                  {errors.newPassword && <div className="invalid-feedback">{errors.newPassword}</div>}
                </div>

                <div className="form-group">
                  <label>Confirm New Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                  {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setChangePassword(false);
                      setErrors({});
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? <Loader size="small" /> : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Statistics Card */}
          <div className="profile-card stats-card">
            <h3>Your Activity</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{user.stats?.totalRequests || 0}</div>
                <div className="stat-label">Total RTIs</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{user.stats?.pendingRequests || 0}</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{user.stats?.resolvedRequests || 0}</div>
                <div className="stat-label">Resolved</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{user.stats?.appealedRequests || 0}</div>
                <div className="stat-label">Appealed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;