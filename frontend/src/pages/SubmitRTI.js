import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rtiAPI, departmentsAPI } from '../utils/api';
import { 
  FaPlus, 
  FaTrash, 
  FaUpload, 
  FaMagic, 
  FaBuilding,
  FaQuestionCircle,
  FaFileAlt,
  FaLanguage
} from 'react-icons/fa';
import RTITemplateGenerator from '../components/RTITemplateGenerator';
import Loader from '../components/Loader';
import './SubmitRTI.css';
import toast from 'react-hot-toast';

const SubmitRTI = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [showTemplateGenerator, setShowTemplateGenerator] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    department: '',
    language: user?.language || 'en',
    questions: [''],
    documents: []
  });
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (formData.description.length > 20) {
      getDepartmentRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.description]);

  const fetchDepartments = async () => {
    try {
      const response = await departmentsAPI.getAll({ language: formData.language });
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    }
  };

  const getDepartmentRecommendations = async () => {
    try {
      const response = await departmentsAPI.recommend({ 
        query: formData.description,
        language: formData.language
      });
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error getting recommendations:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = value;
    setFormData(prev => ({
      ...prev,
      questions: newQuestions
    }));
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, '']
    }));
  };

  const removeQuestion = (index) => {
    if (formData.questions.length > 1) {
      const newQuestions = formData.questions.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        questions: newQuestions
      }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files]
    }));
  };

  const removeFile = (index) => {
    const newFiles = formData.documents.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      documents: newFiles
    }));
  };

  const handleTemplateSelect = (template) => {
    setFormData(prev => ({
      ...prev,
      subject: template.subject,
      questions: template.questions
    }));
    setShowTemplateGenerator(false);
    toast.success('Template applied successfully!');
  };

  const handleAIAutoFill = () => {
    if (formData.description.length < 20) {
      toast.error('Please enter at least 20 characters in the description first.');
      return;
    }
    
    // Mock AI Auto-fill logic
    toast.loading('AI is analyzing your request...', { id: 'ai-load' });
    
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        subject: `Request for Information regarding ${prev.description.substring(0, 30)}...`,
        questions: [
          `Please provide certified copies of records related to ${prev.description.substring(0, 30)}.`,
          `What is the current status of the matter described?`,
          `Who is the concerned authority for this issue?`
        ]
      }));
      toast.success('Form auto-filled by AI!', { id: 'ai-load' });
    }, 1500);
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.department) {
      newErrors.department = 'Please select a department';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    const validQuestions = formData.questions.filter(q => q.trim());
    
    if (validQuestions.length === 0) {
      newErrors.questions = 'At least one question is required';
    } else {
      validQuestions.forEach((q, index) => {
        if (q.length < 5) {
          newErrors[`question_${index}`] = `Question ${index + 1} must be at least 5 characters`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handlePrev = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep1() || !validateStep2()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    try {
      // Filter out empty questions
      const submissionData = {
        ...formData,
        questions: formData.questions.filter(q => q.trim())
      };

      const response = await rtiAPI.submit(submissionData);
      toast.success('RTI application submitted successfully!');
      navigate(`/request/${response.data.requestId}`);
    } catch (error) {
      console.error('Error submitting RTI:', error);
      toast.error(error.response?.data?.message || 'Failed to submit RTI application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submit-rti-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">File RTI Application</h1>
          <p className="page-subtitle">
            Submit your Right to Information request online. All fields marked with * are required.
          </p>
        </div>

        <div className="submit-rti-grid">
          <div className="submit-rti-main glass-panel">
            <div className="wizard-steps" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px'}}>
              <div className={`step-indicator ${step >= 1 ? 'active' : ''}`} style={{fontWeight: step >= 1 ? 'bold' : 'normal', color: step >= 1 ? '#0056b3' : '#666'}}>1. Details</div>
              <div className={`step-indicator ${step >= 2 ? 'active' : ''}`} style={{fontWeight: step >= 2 ? 'bold' : 'normal', color: step >= 2 ? '#0056b3' : '#666'}}>2. Questions & Docs</div>
              <div className={`step-indicator ${step >= 3 ? 'active' : ''}`} style={{fontWeight: step >= 3 ? 'bold' : 'normal', color: step >= 3 ? '#0056b3' : '#666'}}>3. Review</div>
            </div>

            <form onSubmit={handleSubmit} className="rti-form">
              {step === 1 && (
                <>
              {/* Language Selection */}
              <div className="form-section">
                <h3 className="section-title">
                  <FaLanguage /> Language Preference
                </h3>
                <div className="language-options">
                  <label className="language-option">
                    <input
                      type="radio"
                      name="language"
                      value="en"
                      checked={formData.language === 'en'}
                      onChange={handleChange}
                    />
                    <span>English</span>
                  </label>
                  <label className="language-option">
                    <input
                      type="radio"
                      name="language"
                      value="te"
                      checked={formData.language === 'te'}
                      onChange={handleChange}
                    />
                    <span>తెలుగు</span>
                  </label>
                  <label className="language-option">
                    <input
                      type="radio"
                      name="language"
                      value="hi"
                      checked={formData.language === 'hi'}
                      onChange={handleChange}
                    />
                    <span>हिन्दी</span>
                  </label>
                </div>
              </div>

              {/* Department Selection */}
              <div className="form-section">
                <h3 className="section-title">
                  <FaBuilding /> Select Department *
                </h3>
                
                {recommendations.length > 0 && (
                  <div className="recommendations">
                    <p className="recommendations-title">Recommended based on your description:</p>
                    <div className="recommendation-chips">
                      {recommendations.map((dept, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`recommendation-chip ${dept.matchType}`}
                          onClick={() => setFormData(prev => ({ ...prev, department: dept.name }))}
                        >
                          {dept.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`form-control ${errors.department ? 'is-invalid' : ''}`}
                >
                  <option value="">Select a department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
                {errors.department && (
                  <div className="invalid-feedback">{errors.department}</div>
                )}
              </div>

              {/* Subject */}
              <div className="form-section">
                <h3 className="section-title">
                  <FaFileAlt /> Subject *
                </h3>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                  placeholder="Brief subject of your RTI application"
                />
                {errors.subject && (
                  <div className="invalid-feedback">{errors.subject}</div>
                )}
              </div>

              {/* Description */}
              <div className="form-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="section-title" style={{ marginBottom: 0 }}>
                    <FaFileAlt /> Description *
                  </h3>
                  <button 
                    type="button" 
                    className="btn btn-outline-primary btn-sm"
                    onClick={handleAIAutoFill}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    ✨ AI Auto-fill
                  </button>
                </div>
                <div style={{ marginTop: '1rem' }}>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  rows="5"
                  placeholder="Describe the information you are seeking in detail"
                />
                <small className="form-text">
                  Minimum 20 characters. {formData.description.length}/20
                </small>
                {errors.description && (
                  <div className="invalid-feedback">{errors.description}</div>
                )}
                </div>
              </div>
              </>
              )}

              {step === 2 && (
                <>
              {/* Questions */}
              <div className="form-section">
                <div className="section-header">
                  <h3 className="section-title">
                    <FaQuestionCircle /> Questions *
                  </h3>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setShowTemplateGenerator(true)}
                  >
                    <FaMagic /> Use Template
                  </button>
                </div>
                <p className="section-help">
                  Add specific questions you want answered (at least one question required)
                </p>

                {formData.questions.map((question, index) => (
                  <div key={index} className="question-row">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => handleQuestionChange(index, e.target.value)}
                      className={`form-control ${errors[`question_${index}`] ? 'is-invalid' : ''}`}
                      placeholder={`Question ${index + 1}`}
                    />
                    <div className="question-actions">
                      {index === formData.questions.length - 1 && (
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={addQuestion}
                          title="Add question"
                        >
                          <FaPlus />
                        </button>
                      )}
                      {formData.questions.length > 1 && (
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => removeQuestion(index)}
                          title="Remove question"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                    {errors[`question_${index}`] && (
                      <div className="invalid-feedback">{errors[`question_${index}`]}</div>
                    )}
                  </div>
                ))}
                {errors.questions && (
                  <div className="invalid-feedback">{errors.questions}</div>
                )}
              </div>

              {/* Document Upload */}
              <div className="form-section">
                <h3 className="section-title">
                  <FaUpload /> Supporting Documents (Optional)
                </h3>
                <p className="section-help">
                  Upload any supporting documents (PDF, images, DOC). Max 5 files, 5MB each.
                </p>

                <div className="file-upload-area">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="file-input"
                  />
                  <label htmlFor="file-upload" className="file-upload-label">
                    <FaUpload />
                    <span>Click to upload or drag and drop</span>
                    <small>PDF, DOC, JPEG, PNG (Max 5MB each)</small>
                  </label>
                </div>

                {formData.documents.length > 0 && (
                  <div className="file-list">
                    {formData.documents.map((file, index) => (
                      <div key={index} className="file-item">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">
                          {(file.size / 1024).toFixed(2)} KB
                        </span>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => removeFile(index)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              </>
              )}

              {step === 3 && (
                <div className="review-section">
                  <h3 className="section-title">Review Your Application</h3>
                  <div className="review-card" style={{backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px'}}>
                    <p style={{marginBottom: '10px'}}><strong>Department:</strong> {formData.department}</p>
                    <p style={{marginBottom: '10px'}}><strong>Subject:</strong> {formData.subject}</p>
                    <p style={{marginBottom: '10px'}}><strong>Description:</strong> {formData.description}</p>
                    <p style={{marginBottom: '10px', marginTop: '20px'}}><strong>Questions:</strong></p>
                    <ul style={{marginLeft: '20px', marginBottom: '20px'}}>
                      {formData.questions.filter(q => q.trim()).map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                    <p style={{marginBottom: '10px'}}><strong>Documents attached:</strong> {formData.documents.length}</p>
                  </div>
                  <div className="alert alert-info">
                    Submission of this application will incur a fee of ₹10. You will be redirected to the payment gateway after submitting.
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="form-actions" style={{display: 'flex', justifyContent: 'space-between', marginTop: '30px'}}>
                {step > 1 ? (
                  <button type="button" className="btn btn-outline" onClick={handlePrev}>Back</button>
                ) : (
                  <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
                )}
                
                {step < 3 ? (
                  <button type="button" className="btn btn-primary" onClick={handleNext}>Next Step</button>
                ) : (
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <Loader size="small" /> : 'Submit RTI Application'}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="submit-rti-sidebar">
            <div className="info-card glass-panel">
              <h4>RTI Filing Guide</h4>
              <ul>
                <li>✓ Be specific in your questions</li>
                <li>✓ Select the correct department</li>
                <li>✓ Upload relevant documents</li>
                <li>✓ Fee of ₹10 to be paid after submission</li>
                <li>✓ Response within 30 days</li>
              </ul>
            </div>

            <div className="info-card glass-panel">
              <h4>Fee Information</h4>
              <p className="fee-amount">₹10.00</p>
              <p className="fee-note">
                Fee can be paid online after submission through:
              </p>
              <ul>
                <li>✓ Credit/Debit Card</li>
                <li>✓ Net Banking</li>
                <li>✓ UPI</li>
              </ul>
            </div>

            <div className="info-card glass-panel">
              <h4>Need Help?</h4>
              <p>Contact our support team:</p>
              <p className="help-contact">
                Email: support@rticonnect.gov.in<br />
                Phone: 1800-123-4567
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Template Generator Modal */}
      {showTemplateGenerator && (
        <RTITemplateGenerator
          language={formData.language}
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplateGenerator(false)}
        />
      )}
    </div>
  );
};

export default SubmitRTI;