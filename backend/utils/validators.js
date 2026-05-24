// Validation utilities

// Validate email
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate phone number (Indian)
function isValidPhone(phone) {
  const re = /^[6-9]\d{9}$/;
  return re.test(phone);
}

// Validate pincode (Indian)
function isValidPincode(pincode) {
  const re = /^[1-9][0-9]{5}$/;
  return re.test(pincode);
}

// Validate password strength
function validatePassword(password) {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validate RTI request
function validateRTIRequest(data) {
  const errors = {};
  
  // Subject validation
  if (!data.subject || data.subject.trim().length < 5) {
    errors.subject = 'Subject must be at least 5 characters long';
  } else if (data.subject.length > 200) {
    errors.subject = 'Subject must not exceed 200 characters';
  }
  
  // Description validation
  if (!data.description || data.description.trim().length < 20) {
    errors.description = 'Description must be at least 20 characters long';
  } else if (data.description.length > 2000) {
    errors.description = 'Description must not exceed 2000 characters';
  }
  
  // Questions validation
  if (!data.questions || data.questions.length === 0) {
    errors.questions = 'At least one question is required';
  } else {
    data.questions.forEach((q, index) => {
      if (!q || q.trim().length < 5) {
        errors[`question_${index}`] = `Question ${index + 1} must be at least 5 characters long`;
      }
    });
  }
  
  // Department validation
  if (!data.department) {
    errors.department = 'Department is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Validate user registration
function validateUserRegistration(data) {
  const errors = {};
  
  // Name validation
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  }
  
  // Email validation
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Password validation
  if (!data.password) {
    errors.password = 'Password is required';
  } else {
    const passwordCheck = validatePassword(data.password);
    if (!passwordCheck.isValid) {
      errors.password = passwordCheck.errors[0];
    }
  }
  
  // Phone validation
  if (!data.phone) {
    errors.phone = 'Phone number is required';
  } else if (!isValidPhone(data.phone)) {
    errors.phone = 'Please enter a valid 10-digit Indian phone number';
  }
  
  // Address validation (if provided)
  if (data.address) {
    if (data.address.pincode && !isValidPincode(data.address.pincode)) {
      errors.pincode = 'Please enter a valid 6-digit pincode';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Sanitize input
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Parse and validate dates
function validateDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return null;
  }
  return date;
}

// Validate file upload
function validateFile(file) {
  const errors = [];
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (file.size > maxSize) {
    errors.push('File size must be less than 5MB');
  }
  
  if (!allowedTypes.includes(file.mimetype)) {
    errors.push('File type not allowed. Please upload PDF, DOC, or image files.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validate status transition
function isValidStatusTransition(currentStatus, newStatus) {
  const validTransitions = {
    'submitted': ['fee-pending', 'cancelled'],
    'fee-pending': ['fee-paid', 'cancelled'],
    'fee-paid': ['under-review', 'forwarded', 'cancelled'],
    'under-review': ['replied', 'forwarded', 'appealed'],
    'forwarded': ['under-review', 'replied'],
    'replied': ['appealed', 'closed'],
    'rejected': ['appealed', 'closed'],
    'appealed': ['under-review', 'closed'],
    'closed': []
  };
  
  return validTransitions[currentStatus]?.includes(newStatus) || false;
}

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidPincode,
  validatePassword,
  validateRTIRequest,
  validateUserRegistration,
  sanitizeInput,
  validateDate,
  validateFile,
  isValidStatusTransition
};