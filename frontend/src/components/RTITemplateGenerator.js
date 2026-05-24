import React, { useState, useEffect } from 'react';
import { templatesAPI } from '../utils/api';
import { FaTimes, FaSearch, FaMagic } from 'react-icons/fa';
import Loader from './Loader';
import './RTITemplateGenerator.css';
import toast from 'react-hot-toast';

const RTITemplateGenerator = ({ language = 'en', onSelect, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customizations, setCustomizations] = useState({});

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [templatesRes, categoriesRes] = await Promise.all([
        templatesAPI.getAll({ language }),
        templatesAPI.getCategories()
      ]);
      setTemplates(templatesRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
    // Initialize customizations with empty values
    const initialCustomizations = {};
    const placeholders = template.subject.match(/\[(.*?)\]/g) || [];
    placeholders.forEach(placeholder => {
      // eslint-disable-next-line no-useless-escape
      const key = placeholder.replace(/[\[\]]/g, '');
      initialCustomizations[key] = '';
    });
    setCustomizations(initialCustomizations);
  };

  const handleCustomizationChange = (key, value) => {
    setCustomizations(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApplyTemplate = async () => {
    try {
      setLoading(true);
      const response = await templatesAPI.generate({
        templateId: selectedTemplate.id,
        customizations,
        language
      });
      onSelect(response.data);
      toast.success('Template applied successfully!');
    } catch (error) {
      console.error('Error applying template:', error);
      toast.error('Failed to apply template');
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="template-generator-modal">
      <div className="template-generator-overlay" onClick={onClose}></div>
      <div className="template-generator-container">
        <div className="template-generator-header">
          <h2>
            <FaMagic /> RTI Template Generator
          </h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="template-generator-content">
          {!selectedTemplate ? (
            /* Template Selection View */
            <>
              <div className="template-filters">
                <div className="search-box">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="category-filters">
                  <button
                    className={`category-chip ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('all')}
                  >
                    All
                  </button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      className={`category-chip ${selectedCategory === category.id ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.icon} {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <Loader />
              ) : (
                <div className="templates-grid">
                  {filteredTemplates.map(template => (
                    <div
                      key={template.id}
                      className="template-card"
                      onClick={() => handleTemplateClick(template)}
                    >
                      <h3 className="template-name">{template.name}</h3>
                      <p className="template-description">{template.description}</p>
                      <div className="template-preview">
                        <strong>Sample Subject:</strong>
                        <p>{template.subject}</p>
                      </div>
                      <div className="template-category">
                        {categories.find(c => c.id === template.category)?.icon} {template.category}
                      </div>
                    </div>
                  ))}

                  {filteredTemplates.length === 0 && (
                    <div className="no-templates">
                      <p>No templates found matching your criteria.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Template Customization View */
            <div className="template-customization">
              <button
                className="back-btn"
                onClick={() => setSelectedTemplate(null)}
              >
                ← Back to templates
              </button>

              <div className="selected-template-info">
                <h3>{selectedTemplate.name}</h3>
                <p>{selectedTemplate.description}</p>
              </div>

              <div className="customization-form">
                <h4>Customize Your RTI</h4>
                
                <div className="form-group">
                  <label>Subject Template:</label>
                  <div className="template-subject">
                    {selectedTemplate.subject}
                  </div>
                </div>

                {Object.keys(customizations).length > 0 && (
                  <div className="customization-fields">
                    <h5>Fill in the details:</h5>
                    {Object.keys(customizations).map(key => (
                      <div key={key} className="form-group">
                        <label>{key}:</label>
                        <input
                          type="text"
                          className="form-control"
                          value={customizations[key]}
                          onChange={(e) => handleCustomizationChange(key, e.target.value)}
                          placeholder={`Enter ${key}`}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <h5>Preview Questions:</h5>
                <div className="preview-questions">
                  {selectedTemplate.questions.map((question, index) => {
                    let previewQuestion = question;
                    Object.keys(customizations).forEach(key => {
                      previewQuestion = previewQuestion.replace(
                        `[${key}]`,
                        customizations[key] || `[${key}]`
                      );
                    });
                    return (
                      <div key={index} className="preview-question">
                        <span className="question-number">{index + 1}.</span>
                        <span className="question-text">{previewQuestion}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="customization-actions">
                <button
                  className="btn btn-outline"
                  onClick={() => setSelectedTemplate(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleApplyTemplate}
                  disabled={loading}
                >
                  {loading ? <Loader size="small" /> : 'Apply Template'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RTITemplateGenerator;