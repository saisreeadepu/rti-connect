// RTI Templates utility for generating standardized RTI applications

export const templateCategories = [
  { id: 'general', name: 'General Information', icon: '📄', description: 'General information requests' },
  { id: 'scheme', name: 'Government Schemes', icon: '🎯', description: 'Information about government schemes' },
  { id: 'works', name: 'Public Works', icon: '🏗️', description: 'Infrastructure and public works' },
  { id: 'service', name: 'Service Delivery', icon: '⚙️', description: 'Status of services and applications' },
  { id: 'financial', name: 'Financial Information', icon: '💰', description: 'Budget, expenditure, financial records' },
  { id: 'personnel', name: 'Personnel Information', icon: '👥', description: 'Employee and staff related information' },
  { id: 'education', name: 'Education', icon: '📚', description: 'Educational institutions and policies' },
  { id: 'health', name: 'Health', icon: '🏥', description: 'Healthcare services and facilities' },
  { id: 'transport', name: 'Transport', icon: '🚌', description: 'Transport and road infrastructure' },
  { id: 'electricity', name: 'Electricity', icon: '⚡', description: 'Power supply and electricity services' }
];

export const templates = {
  en: [
    {
      id: 'general-info',
      name: 'General Information Request',
      category: 'general',
      description: 'Template for requesting general information from any department',
      subject: 'Request for Information under RTI Act, 2005',
      questions: [
        'Please provide complete information regarding [topic/subject]',
        'What are the procedures and timelines for [specific process]?',
        'How many [items/applications] have been processed in the last [time period]?',
        'What is the current status of [specific matter]?',
        'Please provide copies of relevant documents and records'
      ],
      placeholders: ['topic/subject', 'specific process', 'items/applications', 'time period', 'specific matter']
    },
    {
      id: 'scheme-benefits',
      name: 'Government Scheme Benefits',
      category: 'scheme',
      description: 'Request details about government schemes and benefits',
      subject: 'Information regarding [Scheme Name] under RTI Act',
      questions: [
        'What are the eligibility criteria for this scheme?',
        'How many beneficiaries have been covered so far?',
        'What is the total budget allocated and expenditure incurred?',
        'What is the application process and required documents?',
        'List of officials responsible for implementing the scheme',
        'Details of complaints received and actions taken'
      ],
      placeholders: ['Scheme Name']
    },
    {
      id: 'public-works',
      name: 'Public Works Project Details',
      category: 'works',
      description: 'Information about infrastructure projects and public works',
      subject: 'Request for details regarding [Project Name]',
      questions: [
        'What is the current status of the project?',
        'What is the total estimated cost and expenditure so far?',
        'Who are the contractors and consultants involved?',
        'What is the expected completion date?',
        'Please provide copies of work orders, sanctions, and agreements',
        'Details of quality control measures and inspections conducted'
      ],
      placeholders: ['Project Name']
    },
    {
      id: 'service-status',
      name: 'Service Delivery Status',
      category: 'service',
      description: 'Check status of services applied for',
      subject: 'Status of application for [Service Name]',
      questions: [
        'What is the current status of my application?',
        'When was my application received and acknowledged?',
        'What is the prescribed timeline for this service?',
        'If delayed, reasons for delay and action taken',
        'Name and designation of the officer responsible',
        'When can I expect the service to be delivered?'
      ],
      placeholders: ['Service Name']
    },
    {
      id: 'financial-records',
      name: 'Financial Information Request',
      category: 'financial',
      description: 'Request for financial records and expenditures',
      subject: 'Request for financial information regarding [Department/Scheme]',
      questions: [
        'Total budget allocated for the financial year [year]',
        'Month-wise expenditure details for the last [period]',
        'Details of payments made to vendors/suppliers above [amount]',
        'Copies of audit reports for last [number] years',
        'Details of savings and unspent balance',
        'Information about funds released to various implementing agencies'
      ],
      placeholders: ['Department/Scheme', 'year', 'period', 'amount', 'number']
    },
    {
      id: 'personnel-info',
      name: 'Personnel Information Request',
      category: 'personnel',
      description: 'Information about employees and staff',
      subject: 'Request for personnel information of [Department]',
      questions: [
        'Total number of sanctioned posts in the department',
        'Number of filled and vacant positions category-wise',
        'Details of recruitments done in last [number] years',
        'Promotion policies and promotions implemented',
        'Details of disciplinary actions taken against employees',
        'Information about training programs conducted'
      ],
      placeholders: ['Department', 'number']
    },
    {
      id: 'education-info',
      name: 'Educational Institution Information',
      category: 'education',
      description: 'Information about schools, colleges, and educational institutions',
      subject: 'Request for information regarding [Institution Name]',
      questions: [
        'Total number of students enrolled in each class/course',
        'Number of teachers and their qualifications',
        'Details of infrastructure facilities available',
        'Information about scholarships and financial aid provided',
        'Academic results and pass percentages for last [number] years',
        'Details of fees collected and utilization'
      ],
      placeholders: ['Institution Name', 'number']
    },
    {
      id: 'health-services',
      name: 'Healthcare Services Information',
      category: 'health',
      description: 'Information about hospitals and healthcare services',
      subject: 'Request for information regarding [Hospital/Health Center Name]',
      questions: [
        'Number of patients treated in last [period]',
        'Availability of doctors, nurses, and support staff',
        'List of medical facilities and equipment available',
        'Details of medicines stocked and supplied',
        'Information about health schemes implemented',
        'Patient satisfaction survey results'
      ],
      placeholders: ['Hospital/Health Center Name', 'period']
    },
    {
      id: 'transport-infra',
      name: 'Transport Infrastructure Information',
      category: 'transport',
      description: 'Information about roads, transport, and infrastructure',
      subject: 'Request for information regarding [Project/Department]',
      questions: [
        'Status of ongoing road construction projects',
        'Details of road maintenance works carried out',
        'Information about public transport services',
        'Accident statistics and safety measures',
        'Details of vehicle registration and licenses issued',
        'Information about transport policies and regulations'
      ],
      placeholders: ['Project/Department']
    },
    {
      id: 'electricity-supply',
      name: 'Electricity Supply Information',
      category: 'electricity',
      description: 'Information about power supply and electricity services',
      subject: 'Request for information regarding [Area/Circle]',
      questions: [
        'Details of power supply and outages in [area]',
        'Information about new connections applied and provided',
        'Details of maintenance works and shutdowns',
        'Information about tariff rates and billing',
        'Complaints received and resolved',
        'Details of infrastructure upgrades planned'
      ],
      placeholders: ['Area/Circle']
    }
  ],
  te: [
    {
      id: 'general-info-te',
      name: 'సాధారణ సమాచార అభ్యర్థన',
      category: 'general',
      description: 'ఏదైనా శాఖ నుండి సాధారణ సమాచారాన్ని అభ్యర్థించడానికి టెంప్లేట్',
      subject: 'ఆర్టిఐ చట్టం, 2005 కింద సమాచారం కోసం అభ్యర్థన',
      questions: [
        '[విషయం] గురించి పూర్తి సమాచారం అందించండి',
        '[నిర్దిష్ట ప్రక్రియ] కోసం విధానాలు మరియు కాలపరిమితులు ఏమిటి?',
        'గత [కాలం]లో ఎన్ని [అంశాలు/దరఖాస్తులు] ప్రాసెస్ చేయబడ్డాయి?',
        '[నిర్దిష్ట విషయం] యొక్క ప్రస్తుత స్థితి ఏమిటి?',
        'దయచేసి సంబంధిత పత్రాలు మరియు రికార్డుల కాపీలను అందించండి'
      ],
      placeholders: ['విషయం', 'నిర్దిష్ట ప్రక్రియ', 'అంశాలు/దరఖాస్తులు', 'కాలం', 'నిర్దిష్ట విషయం']
    },
    {
      id: 'scheme-te',
      name: 'ప్రభుత్వ పథకాల సమాచారం',
      category: 'scheme',
      description: 'ప్రభుత్వ పథకాలు మరియు ప్రయోజనాల గురించి వివరాలు అడగండి',
      subject: '[పథకం పేరు] గురించి ఆర్టిఐ చట్టం కింద సమాచారం',
      questions: [
        'ఈ పథకానికి అర్హత ప్రమాణాలు ఏమిటి?',
        'ఇప్పటివరకు ఎంతమంది లబ్ధిదారులు కవర్ అయ్యారు?',
        'కేటాయించిన మొత్తం బడ్జెట్ మరియు ఖర్చు ఎంత?',
        'దరఖాస్తు ప్రక్రియ మరియు అవసరమైన పత్రాలు ఏమిటి?',
        'పథకాన్ని అమలు చేయడానికి బాధ్యత వహించే అధికారుల జాబితా',
        'అందిన ఫిర్యాదులు మరియు తీసుకున్న చర్యల వివరాలు'
      ],
      placeholders: ['పథకం పేరు']
    }
  ],
  hi: [
    {
      id: 'general-info-hi',
      name: 'सामान्य सूचना अनुरोध',
      category: 'general',
      description: 'किसी भी विभाग से सामान्य जानकारी का अनुरोध करने के लिए टेम्पलेट',
      subject: 'आरटीआई अधिनियम, 2005 के तहत सूचना का अनुरोध',
      questions: [
        '[विषय] के बारे में पूरी जानकारी प्रदान करें',
        '[विशिष्ट प्रक्रिया] के लिए प्रक्रियाएं और समयसीमाएं क्या हैं?',
        'पिछले [समय अवधि] में कितने [आइटम/आवेदन] संसाधित किए गए?',
        '[विशिष्ट मामले] की वर्तमान स्थिति क्या है?',
        'कृपया प्रासंगिक दस्तावेजों और रिकॉर्ड की प्रतियां प्रदान करें'
      ],
      placeholders: ['विषय', 'विशिष्ट प्रक्रिया', 'आइटम/आवेदन', 'समय अवधि', 'विशिष्ट मामले']
    },
    {
      id: 'scheme-hi',
      name: 'सरकारी योजना जानकारी',
      category: 'scheme',
      description: 'सरकारी योजनाओं और लाभों के बारे में विवरण मांगें',
      subject: '[योजना का नाम] के बारे में आरटीआई अधिनियम के तहत जानकारी',
      questions: [
        'इस योजना के लिए पात्रता मानदंड क्या हैं?',
        'अब तक कितने लाभार्थी कवर किए गए हैं?',
        'कुल आवंटित बजट और व्यय कितना है?',
        'आवेदन प्रक्रिया और आवश्यक दस्तावेज क्या हैं?',
        'योजना को लागू करने के लिए जिम्मेदार अधिकारियों की सूची',
        'प्राप्त शिकायतों और की गई कार्रवाई का विवरण'
      ],
      placeholders: ['योजना का नाम']
    }
  ]
};

// Helper function to get templates by language and category
export const getTemplates = (language = 'en', category = null) => {
  let templateList = templates[language] || templates.en;
  
  if (category && category !== 'all') {
    templateList = templateList.filter(t => t.category === category);
  }
  
  return templateList;
};

// Helper function to get template by ID
export const getTemplateById = (id, language = 'en') => {
  const templateList = templates[language] || templates.en;
  return templateList.find(t => t.id === id);
};

// Helper function to generate RTI from template
export const generateFromTemplate = (templateId, customizations, language = 'en') => {
  const template = getTemplateById(templateId, language);
  
  if (!template) {
    return null;
  }

  let subject = template.subject;
  let questions = [...template.questions];

  // Replace placeholders with custom values
  if (customizations) {
    Object.keys(customizations).forEach(key => {
      const value = customizations[key];
      if (value) {
        const placeholder = `[${key}]`;
        subject = subject.replace(new RegExp(placeholder, 'g'), value);
        questions = questions.map(q => q.replace(new RegExp(placeholder, 'g'), value));
      }
    });
  }

  return {
    subject,
    questions,
    templateId: template.id,
    category: template.category
  };
};

// Helper function to suggest templates based on keywords
export const suggestTemplates = (keywords, language = 'en', limit = 3) => {
  const templateList = templates[language] || templates.en;
  const searchTerms = keywords.toLowerCase().split(/\s+/);
  
  const scored = templateList.map(template => {
    let score = 0;
    const searchableText = `${template.name} ${template.description} ${template.questions.join(' ')}`.toLowerCase();
    
    searchTerms.forEach(term => {
      if (term.length > 2) {
        if (searchableText.includes(term)) {
          score += 5;
        }
        if (template.category.toLowerCase().includes(term)) {
          score += 10;
        }
      }
    });
    
    return { ...template, score };
  });
  
  return scored
    .filter(t => t.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

// Helper function to get templates by department
export const getTemplatesByDepartment = (department, language = 'en') => {
  const departmentCategoryMap = {
    'Municipal Corporation': ['general', 'works', 'service'],
    'నగరపాలక సంస్థ': ['general', 'works', 'service'],
    'Revenue Department': ['financial', 'general'],
    'ఆదాయ శాఖ': ['financial', 'general'],
    'Education Department': ['education', 'general', 'personnel'],
    'విద్యా శాఖ': ['education', 'general', 'personnel'],
    'Health Department': ['health', 'service', 'general'],
    'ఆరోగ్య శాఖ': ['health', 'service', 'general'],
    'Police Department': ['service', 'general'],
    'పోలీస్ శాఖ': ['service', 'general'],
    'Transport Department': ['transport', 'general', 'works'],
    'రవాణా శాఖ': ['transport', 'general', 'works'],
    'Electricity Board': ['electricity', 'service', 'works'],
    'విద్యుత్ బోర్డు': ['electricity', 'service', 'works']
  };

  const allowedCategories = departmentCategoryMap[department] || ['general'];
  const templateList = templates[language] || templates.en;
  
  return templateList.filter(t => allowedCategories.includes(t.category));
};

// Export all templates
export default templates;