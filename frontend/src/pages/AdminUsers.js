import React, { useState, useEffect } from 'react';
import { userAPI } from '../utils/api';
import { 
  FaUsers, 
  FaSearch, 
  FaFilter, 
  FaUserPlus,
  FaEdit,
  FaUserTie,
  FaUser,
  FaBalanceScale,
  FaCheckCircle,
  FaTimesCircle,
  FaBuilding  // Add this missing import
} from 'react-icons/fa';
import Loader from '../components/Loader';
import './AdminUsers.css';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    role: 'all',
    search: '',
    status: 'all'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'citizen',
    department: '',
    isActive: true
  });

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.role, filters.status, pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers({
        role: filters.role !== 'all' ? filters.role : undefined,
        search: filters.search || undefined,
        page: pagination.page,
        limit: 10
      });
      
      setUsers(response.data.users);
      setPagination({
        page: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      department: user.department || '',
      isActive: user.isActive
    });
    setShowUserModal(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'citizen',
      department: '',
      isActive: true
    });
    setShowUserModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (selectedUser) {
        await userAPI.updateUser(selectedUser._id, formData);
        toast.success('User updated successfully');
      } else {
        await userAPI.createUser(formData);
        toast.success('User created successfully');
      }
      setShowUserModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(error.response?.data?.message || 'Failed to save user');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await userAPI.updateUser(user._id, { isActive: !user.isActive });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return <FaUserTie />;
      case 'pio': return <FaBuilding />;
      case 'appellate': return <FaBalanceScale />;
      default: return <FaUser />;
    }
  };

  const filteredUsers = users.filter(user => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return user.name.toLowerCase().includes(searchLower) ||
             user.email.toLowerCase().includes(searchLower) ||
             user.phone.includes(searchLower);
    }
    return true;
  });

  return (
    <div className="admin-users-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <FaUsers /> User Management
            </h1>
            <p className="page-subtitle">
              Manage all users of the RTI Connect platform
            </p>
          </div>
          <button onClick={handleCreateUser} className="btn btn-primary">
            <FaUserPlus /> Add New User
          </button>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-box">
            <form onSubmit={handleSearch}>
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, email, or phone"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="form-control"
              />
            </form>
          </div>

          <div className="filter-options">
            <div className="filter-group">
              <FaFilter className="filter-icon" />
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="form-control"
              >
                <option value="all">All Roles</option>
                <option value="citizen">Citizens</option>
                <option value="pio">PIOs</option>
                <option value="appellate">Appellate</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            <div className="filter-group">
              <FaFilter className="filter-icon" />
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="form-control"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <Loader />
        ) : (
          <>
            <div className="table-responsive">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user._id}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">
                            {getRoleIcon(user.role)}
                          </div>
                          <div>
                            <div className="user-name">{user.name}</div>
                            <div className="user-email">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="user-contact">
                          <div>{user.phone}</div>
                        </div>
                      </td>
                      <td>
                        <span className={`role-badge role-${user.role}`}>
                          {getRoleIcon(user.role)} {user.role}
                        </span>
                      </td>
                      <td>{user.department || '—'}</td>
                      <td>
                        <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                          {user.isActive ? <FaCheckCircle /> : <FaTimesCircle />}
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon"
                            onClick={() => handleEditUser(user)}
                            title="Edit User"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className={`btn-icon ${user.isActive ? 'warning' : 'success'}`}
                            onClick={() => handleToggleStatus(user)}
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {user.isActive ? <FaTimesCircle /> : <FaCheckCircle />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  className="btn btn-outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>{selectedUser ? 'Edit User' : 'Create New User'}</h3>
              <button className="close-btn" onClick={() => setShowUserModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                  disabled={selectedUser}
                />
              </div>

              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Role *</label>
                <select
                  name="role"
                  className="form-control"
                  value={formData.role}
                  onChange={handleFormChange}
                  required
                >
                  <option value="citizen">Citizen</option>
                  <option value="pio">PIO</option>
                  <option value="appellate">Appellate Authority</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {(formData.role === 'pio' || formData.role === 'appellate') && (
                <div className="form-group">
                  <label>Department *</label>
                  <input
                    type="text"
                    name="department"
                    className="form-control"
                    value={formData.department}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              )}

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleFormChange}
                  />
                  Active Account
                </label>
              </div>

              {!selectedUser && (
                <div className="form-group">
                  <label>Temporary Password</label>
                  <input
                    type="text"
                    className="form-control"
                    value="Welcome@123"
                    disabled
                  />
                  <small className="form-text">User can change this after first login</small>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowUserModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {selectedUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;