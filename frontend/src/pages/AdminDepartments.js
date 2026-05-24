import React, { useState, useEffect } from 'react';
import { departmentsAPI, userAPI } from '../utils/api';
import { 
  FaBuilding, 
  FaPlus, 
  FaEdit, 
  FaTrash,
  FaUserTie,
  FaBalanceScale,
  FaUsers,
  FaChartBar
} from 'react-icons/fa';
import Loader from '../components/Loader';
import './AdminDepartments.css';
import toast from 'react-hot-toast';

const AdminDepartments = () => {
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [pios, setPios] = useState([]);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showPIOModal, setShowPIOModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedPIO, setSelectedPIO] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    keywords: '',
    language: 'en',
    contactInfo: {
      address: '',
      phone: '',
      email: '',
      officeHours: ''
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptsRes, piosRes] = await Promise.all([
        departmentsAPI.getAll(),
        userAPI.getAllUsers({ role: 'pio' })
      ]);
      setDepartments(deptsRes.data);
      setPios(piosRes.data.users);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDepartment = (dept) => {
    setSelectedDepartment(dept);
    setFormData({
      name: dept.name,
      description: dept.description || '',
      keywords: dept.keywords?.join(', ') || '',
      language: dept.language || 'en',
      contactInfo: dept.contactInfo || {
        address: '',
        phone: '',
        email: '',
        officeHours: ''
      }
    });
    setShowDepartmentModal(true);
  };

  const handleCreateDepartment = () => {
    setSelectedDepartment(null);
    setFormData({
      name: '',
      description: '',
      keywords: '',
      language: 'en',
      contactInfo: {
        address: '',
        phone: '',
        email: '',
        officeHours: ''
      }
    });
    setShowDepartmentModal(true);
  };

  const handleAssignPIO = (dept) => {
    setSelectedDepartment(dept);
    setSelectedPIO(null);
    setShowPIOModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('contact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDepartmentSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k)
    };

    try {
      if (selectedDepartment) {
        await departmentsAPI.update(selectedDepartment._id, submitData);
        toast.success('Department updated successfully');
      } else {
        await departmentsAPI.create(submitData);
        toast.success('Department created successfully');
      }
      setShowDepartmentModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving department:', error);
      toast.error(error.response?.data?.message || 'Failed to save department');
    }
  };

  const handleAssignPIOSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (selectedPIO) {
        await departmentsAPI.assignPIO(selectedDepartment._id, { pioId: selectedPIO });
        toast.success('PIO assigned successfully');
        setShowPIOModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error assigning PIO:', error);
      toast.error('Failed to assign PIO');
    }
  };

  const handleRemovePIO = async (deptId, pioId) => {
    if (window.confirm('Are you sure you want to remove this PIO?')) {
      try {
        await departmentsAPI.removePIO(deptId, pioId);
        toast.success('PIO removed successfully');
        fetchData();
      } catch (error) {
        console.error('Error removing PIO:', error);
        toast.error('Failed to remove PIO');
      }
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="admin-departments-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <FaBuilding /> Department Management
            </h1>
            <p className="page-subtitle">
              Manage government departments and assign PIOs
            </p>
          </div>
          <button onClick={handleCreateDepartment} className="btn btn-primary">
            <FaPlus /> Add Department
          </button>
        </div>

        {/* Departments Grid */}
        <div className="departments-grid">
          {departments.map(dept => (
            <div key={dept._id} className="department-card">
              <div className="department-header">
                <h3>{dept.name}</h3>
                <div className="department-actions">
                  <button 
                    className="btn-icon"
                    onClick={() => handleEditDepartment(dept)}
                    title="Edit Department"
                  >
                    <FaEdit />
                  </button>
                </div>
              </div>

              <p className="department-description">{dept.description}</p>

              <div className="department-stats">
                <div className="stat">
                  <FaUsers />
                  <span>{dept.stats?.totalRequests || 0} Total RTIs</span>
                </div>
                <div className="stat">
                  <FaChartBar />
                  <span>{dept.stats?.resolutionRate || 0}% Resolution</span>
                </div>
              </div>

              <div className="department-pios">
                <h4>
                  <FaUserTie /> Assigned PIOs
                  <button 
                    className="btn-add-pio"
                    onClick={() => handleAssignPIO(dept)}
                    title="Assign PIO"
                  >
                    <FaPlus />
                  </button>
                </h4>
                {dept.pios?.length > 0 ? (
                  <div className="pios-list">
                    {dept.pios.map(pio => (
                      <div key={pio._id} className="pio-item">
                        <div className="pio-info">
                          <span className="pio-name">{pio.name}</span>
                          <span className="pio-email">{pio.email}</span>
                        </div>
                        <button
                          className="btn-remove"
                          onClick={() => handleRemovePIO(dept._id, pio._id)}
                          title="Remove PIO"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-pios">No PIOs assigned</p>
                )}
              </div>

              {dept.appellateAuthority && (
                <div className="department-appellate">
                  <h4><FaBalanceScale /> Appellate Authority</h4>
                  <div className="appellate-info">
                    <span>{dept.appellateAuthority.name}</span>
                    <span className="appellate-email">{dept.appellateAuthority.email}</span>
                  </div>
                </div>
              )}

              <div className="department-keywords">
                {dept.keywords?.map((keyword, index) => (
                  <span key={index} className="keyword-tag">{keyword}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department Modal */}
      {showDepartmentModal && (
        <div className="modal-overlay">
          <div className="modal-container large">
            <div className="modal-header">
              <h3>{selectedDepartment ? 'Edit Department' : 'Create New Department'}</h3>
              <button className="close-btn" onClick={() => setShowDepartmentModal(false)}>×</button>
            </div>
            <form onSubmit={handleDepartmentSubmit} className="modal-form">
              <div className="form-group">
                <label>Department Name *</label>
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
                <label>Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="3"
                  value={formData.description}
                  onChange={handleFormChange}
                ></textarea>
              </div>

              <div className="form-group">
                <label>Keywords (comma-separated)</label>
                <input
                  type="text"
                  name="keywords"
                  className="form-control"
                  value={formData.keywords}
                  onChange={handleFormChange}
                  placeholder="e.g., water, tax, property, road"
                />
              </div>

              <div className="form-group">
                <label>Language</label>
                <select
                  name="language"
                  className="form-control"
                  value={formData.language}
                  onChange={handleFormChange}
                >
                  <option value="en">English</option>
                  <option value="te">తెలుగు</option>
                  <option value="hi">हिन्दी</option>
                </select>
              </div>

              <h4>Contact Information</h4>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="contact.address"
                  className="form-control"
                  rows="2"
                  value={formData.contactInfo.address}
                  onChange={handleFormChange}
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    name="contact.phone"
                    className="form-control"
                    value={formData.contactInfo.phone}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="contact.email"
                    className="form-control"
                    value={formData.contactInfo.email}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Office Hours</label>
                <input
                  type="text"
                  name="contact.officeHours"
                  className="form-control"
                  value={formData.contactInfo.officeHours}
                  onChange={handleFormChange}
                  placeholder="e.g., Mon-Fri 10AM-6PM"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowDepartmentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {selectedDepartment ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign PIO Modal */}
      {showPIOModal && selectedDepartment && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Assign PIO to {selectedDepartment.name}</h3>
              <button className="close-btn" onClick={() => setShowPIOModal(false)}>×</button>
            </div>
            <form onSubmit={handleAssignPIOSubmit} className="modal-form">
              <div className="form-group">
                <label>Select PIO</label>
                <select
                  className="form-control"
                  value={selectedPIO || ''}
                  onChange={(e) => setSelectedPIO(e.target.value)}
                  required
                >
                  <option value="">Choose a PIO...</option>
                  {pios
                    .filter(p => !selectedDepartment.pios?.some(assigned => assigned._id === p._id))
                    .map(pio => (
                      <option key={pio._id} value={pio._id}>
                        {pio.name} - {pio.email}
                      </option>
                    ))
                  }
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowPIOModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Assign PIO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDepartments;