// Simple AI helper for department recommendation and categorization

// Department keyword mapping
const departmentKeywords = {
  'Municipal Corporation': [
    'water', 'tax', 'property', 'sanitation', 'garbage', 'road', 'building',
    'municipal', 'civic', 'drainage', 'sewage', 'street light', 'park',
    ' नगर निगम', 'पानी', 'कर', 'संपत्ति', 'सड़क', 'भवन',
    'నగరపాలక', 'నీరు', 'పన్ను', 'ఆస్తి', 'రోడ్డు', 'భవనం'
  ],
  'Revenue Department': [
    'land', 'property', 'registration', 'stamp', 'revenue', 'agriculture',
    'record', 'patta', 'survey', 'boundary', ' राजस्व', 'भूमि', 'संपत्ति',
    'ఆదాయం', 'భూమి', 'ఆస్తి', 'రిజిస్ట్రేషన్'
  ],
  'Police Department': [
    'crime', 'police', 'safety', 'theft', 'complaint', 'security', 'law',
    'fir', 'investigation', 'arrest', ' पुलिस', 'अपराध', 'सुरक्षा',
    'పోలీస్', 'నేరం', 'భద్రత', 'ఫిర్యాదు'
  ],
  'Education Department': [
    'school', 'college', 'education', 'student', 'teacher', 'scholarship',
    'exam', 'admission', ' शिक्षा', 'स्कूल', 'छात्र', 'शिक्षक',
    'విద్య', 'పాఠశాల', 'కళాశాల', 'విద్యార్థి', 'ఉపాధ్యాయుడు'
  ],
  'Health Department': [
    'health', 'hospital', 'medical', 'doctor', 'treatment', 'medicine',
    'clinic', 'disease', 'vaccination', ' स्वास्थ्य', 'अस्पताल', 'चिकित्सा',
    'ఆరోగ్యం', 'ఆసుపత్రి', 'వైద్య', 'చికిత్స'
  ],
  'Transport Department': [
    'transport', 'vehicle', 'license', 'driving', 'registration', 'road',
    'rto', 'bus', ' परिवहन', 'वाहन', 'लाइसेंस', 'ड्राइविंग',
    'రవాణా', 'వాహనం', 'లైసెన్స్', 'డ్రైవింగ్'
  ],
  'Electricity Board': [
    'electricity', 'power', 'bill', 'connection', 'meter', 'voltage',
    'current', 'बिजली', 'विद्युत', 'मीटर', 'कनेक्शन',
    'విద్యుత్', 'పవర్', 'బిల్లు', 'కనెక్షన్'
  ]
};

// Categorize RTI request
function categorizeRequest(text) {
  const categories = {
    'general': ['information', 'details', 'status', 'procedure', ' सामान्य', 'సాధారణ'],
    'financial': ['budget', 'expenditure', 'fund', 'payment', 'cost', ' वित्तीय', 'ఆర్థిక'],
    'personnel': ['employee', 'staff', 'officer', 'recruitment', ' कार्मिक', 'సిబ్బంది'],
    'service': ['service', 'application', 'processing', 'delay', ' सेवा', 'సేవ'],
    'scheme': ['scheme', 'benefit', 'subsidy', ' योजना', 'పథకం'],
    'works': ['project', 'construction', 'work', ' निर्माण', 'పనులు']
  };

  let bestCategory = 'general';
  let maxScore = 0;
  const lowerText = text.toLowerCase();

  for (const [category, keywords] of Object.entries(categories)) {
    let score = 0;
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        score += 1;
      }
    });
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}

// Recommend department based on query
function recommendDepartment(query) {
  const scores = {};
  const lowerQuery = query.toLowerCase();

  // Initialize scores
  Object.keys(departmentKeywords).forEach(dept => {
    scores[dept] = 0;
  });

  // Calculate scores based on keyword matches
  for (const [dept, keywords] of Object.entries(departmentKeywords)) {
    keywords.forEach(keyword => {
      if (lowerQuery.includes(keyword)) {
        scores[dept] += 10;
      }
      // Check for partial matches (for longer queries)
      if (keyword.length > 4 && lowerQuery.includes(keyword.substring(0, 4))) {
        scores[dept] += 3;
      }
    });
  }

  // Sort departments by score
  const sorted = Object.entries(scores)
    .map(([dept, score]) => ({ dept, score }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return sorted;
}

// Extract key information from RTI text
function extractKeyInfo(text) {
  const info = {
    departments: [],
    keywords: [],
    urgency: 'normal',
    requiresDocuments: false
  };

  const lowerText = text.toLowerCase();

  // Detect urgency
  const urgentWords = ['urgent', 'immediate', 'emergency', ' तत्काल', 'అత్యవసర'];
  urgentWords.forEach(word => {
    if (lowerText.includes(word)) {
      info.urgency = 'urgent';
    }
  });

  // Check if documents might be needed
  const docIndicators = ['document', 'certificate', 'proof', 'copy', ' दस्तावेज', 'పత్రం'];
  docIndicators.forEach(word => {
    if (lowerText.includes(word)) {
      info.requiresDocuments = true;
    }
  });

  // Extract potential keywords (simple implementation)
  const words = text.split(/\s+/);
  const stopWords = ['the', 'and', 'for', 'with', 'from', 'है', 'और', 'के', 'మరియు', 'నుండి'];
  
  words.forEach(word => {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
    if (cleanWord.length > 3 && !stopWords.includes(cleanWord)) {
      info.keywords.push(cleanWord);
    }
  });

  // Limit keywords
  info.keywords = [...new Set(info.keywords)].slice(0, 10);

  return info;
}

// Check if request is valid (basic validation)
function validateRTIRequest(subject, description, questions) {
  const errors = [];

  if (!subject || subject.trim().length < 5) {
    errors.push('Subject must be at least 5 characters long');
  }

  if (!description || description.trim().length < 20) {
    errors.push('Description must be at least 20 characters long');
  }

  if (!questions || questions.length === 0) {
    errors.push('At least one question is required');
  }

  questions?.forEach((q, index) => {
    if (!q || q.trim().length < 5) {
      errors.push(`Question ${index + 1} must be at least 5 characters long`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  recommendDepartment,
  categorizeRequest,
  extractKeyInfo,
  validateRTIRequest,
  departmentKeywords
};