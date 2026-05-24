const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// RTI Templates based on common request types
const templates = {
  en: [
    {
      id: 'general',
      name: 'General Information Request',
      description: 'Template for requesting general information from any department',
      subject: 'Request for Information under RTI Act, 2005',
      questions: [
        'Please provide the following information:',
        'What are the procedures and timelines for...',
        'How many applications have been processed in the last year?',
        'What is the current status of...'
      ],
      category: 'general'
    },
    {
      id: 'government-scheme',
      name: 'Government Scheme Information',
      description: 'Request details about government schemes and benefits',
      subject: 'Information regarding [Scheme Name] under RTI Act',
      questions: [
        'What are the eligibility criteria for this scheme?',
        'How many beneficiaries have been covered so far?',
        'What is the total budget allocated?',
        'What is the application process?',
        'List of documents required for application'
      ],
      category: 'scheme'
    },
    {
      id: 'public-works',
      name: 'Public Works Department',
      description: 'Information about infrastructure projects and public works',
      subject: 'Request for details regarding [Project Name]',
      questions: [
        'What is the current status of the project?',
        'What is the total estimated cost and expenditure so far?',
        'Who are the contractors involved?',
        'What is the expected completion date?',
        'Please provide copies of work orders and sanctions'
      ],
      category: 'works'
    },
    {
      id: 'service-delivery',
      name: 'Service Delivery Status',
      description: 'Check status of services applied for',
      subject: 'Status of application for [Service Name]',
      questions: [
        'What is the current status of my application?',
        'When was my application received?',
        'What is the expected processing time?',
        'If delayed, reasons for delay',
        'Name and designation of the officer responsible'
      ],
      category: 'service'
    },
    {
      id: 'financial',
      name: 'Financial Information',
      description: 'Request for financial records and expenditures',
      subject: 'Request for financial information regarding [Department/Scheme]',
      questions: [
        'Total budget allocated for the financial year',
        'Expenditure details month-wise',
        'Details of payments made to vendors/suppliers',
        'Copies of audit reports for last 3 years',
        'Details of savings and unspent balance'
      ],
      category: 'financial'
    },
    {
      id: 'personnel',
      name: 'Personnel Information',
      description: 'Information about employees and staff',
      subject: 'Request for personnel information of [Department]',
      questions: [
        'Total number of sanctioned posts',
        'Number of filled and vacant positions',
        'Details of recruitments done in last 2 years',
        'Promotion policies and implemented promotions',
        'Details of disciplinary actions taken'
      ],
      category: 'personnel'
    }
  ],
  te: [
    {
      id: 'general-te',
      name: 'సాధారణ సమాచార అభ్యర్థన',
      description: 'ఏదైనా శాఖ నుండి సాధారణ సమాచారాన్ని అభ్యర్థించడానికి టెంప్లేట్',
      subject: 'ఆర్టిఐ చట్టం, 2005 కింద సమాచారం కోసం అభ్యర్థన',
      questions: [
        'దయచేసి కింది సమాచారాన్ని అందించండి:',
        '... కోసం విధానాలు మరియు కాలపరిమితులు ఏమిటి?',
        'గత సంవత్సరంలో ఎన్ని దరఖాస్తులు ప్రాసెస్ చేయబడ్డాయి?',
        '... యొక్క ప్రస్తుత స్థితి ఏమిటి?'
      ],
      category: 'general'
    },
    {
      id: 'scheme-te',
      name: 'ప్రభుత్వ పథకాల సమాచారం',
      description: 'ప్రభుత్వ పథకాలు మరియు ప్రయోజనాల గురించి వివరాలు అడగండి',
      subject: '[పథకం పేరు] గురించి ఆర్టిఐ చట్టం కింద సమాచారం',
      questions: [
        'ఈ పథకానికి అర్హత ప్రమాణాలు ఏమిటి?',
        'ఇప్పటివరకు ఎంతమంది లబ్ధిదారులు కవర్ అయ్యారు?',
        'కేటాయించిన మొత్తం బడ్జెట్ ఎంత?',
        'దరఖాస్తు ప్రక్రియ ఏమిటి?',
        'దరఖాస్తుకు అవసరమైన పత్రాల జాబితా'
      ],
      category: 'scheme'
    }
  ],
  hi: [
    {
      id: 'general-hi',
      name: 'सामान्य सूचना अनुरोध',
      description: 'किसी भी विभाग से सामान्य जानकारी का अनुरोध करने के लिए टेम्पलेट',
      subject: 'आरटीआई अधिनियम, 2005 के तहत सूचना का अनुरोध',
      questions: [
        'कृपया निम्नलिखित जानकारी प्रदान करें:',
        '... के लिए प्रक्रियाएं और समयसीमा क्या हैं?',
        'पिछले वर्ष में कितने आवेदन संसाधित किए गए?',
        '... की वर्तमान स्थिति क्या है?'
      ],
      category: 'general'
    }
  ]
};

// Get all templates
router.get('/', async (req, res) => {
  try {
    const { language = 'en', category } = req.query;
    let filteredTemplates = templates[language] || templates.en;

    if (category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === category);
    }

    res.json(filteredTemplates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get template by ID
router.get('/:id', async (req, res) => {
  try {
    const { language = 'en' } = req.query;
    const template = (templates[language] || templates.en).find(t => t.id === req.params.id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get template categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = [
      { id: 'general', name: 'General Information', icon: '📄' },
      { id: 'scheme', name: 'Government Schemes', icon: '🎯' },
      { id: 'works', name: 'Public Works', icon: '🏗️' },
      { id: 'service', name: 'Service Delivery', icon: '⚙️' },
      { id: 'financial', name: 'Financial Information', icon: '💰' },
      { id: 'personnel', name: 'Personnel Information', icon: '👥' }
    ];
    
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate RTI from template
router.post('/generate', auth, async (req, res) => {
  try {
    const { templateId, customizations, language = 'en' } = req.body;
    
    const template = (templates[language] || templates.en).find(t => t.id === templateId);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Customize template based on user input
    let subject = template.subject;
    let questions = [...template.questions];

    // Replace placeholders with custom values
    if (customizations) {
      Object.keys(customizations).forEach(key => {
        const value = customizations[key];
        subject = subject.replace(`[${key}]`, value);
        questions = questions.map(q => q.replace(`[${key}]`, value));
      });
    }

    res.json({
      subject,
      questions,
      template: template.id,
      category: template.category
    });
  } catch (error) {
    console.error('Generate template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get template suggestions based on department
router.post('/suggest', async (req, res) => {
  try {
    const { department, keywords, language = 'en' } = req.body;
    
    let suggestedTemplates = templates[language] || templates.en;
    
    // Filter templates based on department and keywords
    if (department) {
      // Department-specific template mapping
      const deptMap = {
        'Municipal Corporation': ['general', 'works', 'service'],
        'Revenue Department': ['financial', 'general'],
        'Education Department': ['scheme', 'general', 'personnel'],
        'Health Department': ['service', 'general'],
        'Police Department': ['service', 'general'],
        'Transport Department': ['service', 'general'],
        'Electricity Board': ['service', 'works']
      };
      
      const allowedCategories = deptMap[department] || ['general'];
      suggestedTemplates = suggestedTemplates.filter(t => allowedCategories.includes(t.category));
    }
    
    if (keywords && keywords.length > 0) {
      // Score templates based on keyword relevance
      const scored = suggestedTemplates.map(template => {
        let score = 0;
        const searchText = `${template.name} ${template.description} ${template.questions.join(' ')}`.toLowerCase();
        
        keywords.forEach(keyword => {
          if (searchText.includes(keyword.toLowerCase())) {
            score += 5;
          }
        });
        
        return { ...template, score };
      });
      
      suggestedTemplates = scored.filter(t => t.score > 0).sort((a, b) => b.score - a.score);
    }
    
    res.json(suggestedTemplates.slice(0, 5)); // Return top 5 suggestions
  } catch (error) {
    console.error('Template suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;