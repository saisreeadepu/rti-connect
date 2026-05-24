const express = require('express');
const router = express.Router();
const Department = require('../models/Department');

// Chatbot rules and intents
const intents = [
  {
    keywords: ['fee', 'cost', 'price', 'money', 'pay', 'charge'],
    response: 'The application fee for filing an RTI request is ₹10. Additional fees may apply for document copies (e.g., ₹2 per page).'
  },
  {
    keywords: ['time', 'days', 'how long', 'duration', 'when', 'deadline'],
    response: 'By law, the Public Information Officer (PIO) must respond to your RTI request within 30 days.'
  },
  {
    keywords: ['appeal', 'first appeal', 'reject', 'denied'],
    response: 'If your RTI request is rejected or you do not receive a reply within 30 days, you can file a First Appeal within 30 days from the decision.'
  },
  {
    keywords: ['format', 'how to write', 'language', 'english', 'hindi'],
    response: 'RTI applications can be written in English, Hindi, or the official language of the area. There is no strict format, but you must clearly specify the information you seek.'
  },
  {
    keywords: ['who can', 'eligibility', 'citizen', 'nri'],
    response: 'Any citizen of India can file an RTI application. NRIs with Indian citizenship can also file RTIs.'
  },
  {
    keywords: ['bpl', 'below poverty line', 'poor'],
    response: 'If you belong to the Below Poverty Line (BPL) category, you are exempt from paying the RTI application fee. You must attach a copy of your BPL certificate.'
  },
  {
    keywords: ['hi', 'hello', 'hey', 'start'],
    response: 'Hello! I am the RTI Connect Assistant. How can I help you with your Right to Information queries today?'
  }
];

// Fallback response
const fallbackResponse = "I'm not perfectly sure about that. Try asking about RTI fees, processing time, appeals, or how to file a request.";

// Basic AI logic using keyword matching
function getBotResponse(message) {
  const lowerMsg = message.toLowerCase();
  
  // Find highest matching intent
  for (let intent of intents) {
    for (let keyword of intent.keywords) {
      if (lowerMsg.includes(keyword)) {
        return intent.response;
      }
    }
  }
  
  return fallbackResponse;
}

router.post('/', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    // In a real production app, this could connect to OpenAI / Gemini API
    // const aiResponse = await openai.createChatCompletion({...})
    
    // We use rule-based matching to simulate AI for demonstration
    // with a slight delay to simulate processing
    setTimeout(async () => {
      // Special logic for "which department?"
      if (message.toLowerCase().includes('department for') || message.toLowerCase().includes('department to')) {
        const query = message.split(/for|to/)[1]?.trim();
        if (query) {
          try {
            const depts = await Department.find({ 
              keywords: { $in: query.split(' ').map(w => w.toLowerCase()) } 
            }).limit(1);
            
            if (depts.length > 0) {
              return res.json({ 
                reply: `Based on your query, the **${depts[0].name}** would be the appropriate department.`,
                departmentId: depts[0]._id
              });
            }
          } catch(e) {}
        }
      }

      const reply = getBotResponse(message);
      res.json({ reply });
    }, 800);

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ reply: 'Sorry, I am having trouble processing your request right now.' });
  }
});

module.exports = router;
