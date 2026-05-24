import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRobot, FaTimes, FaMicrophone, FaPaperPlane, FaStop } from 'react-icons/fa';
import { chatbotAPI } from '../utils/api';
import './Chatbot.css';

const quickQuestionsList = [
  "1. How do I file an RTI?",
  "2. What is the RTI fee?",
  "3. How long for a response?",
  "4. I want land records.",
  "5. Road repair in my area.",
  "6. Hospital doctor info.",
  "7. How to file an appeal?",
  "8. What is RTI Act?"
];

const quickQuestionsData = {
  "1. How do I file an RTI?": "To file an RTI, draft your application, attach the required fee, and submit it to the Public Information Officer (PIO) of the concerned department.",
  "2. What is the RTI fee?": "The application fee for an RTI is generally ₹10 for the Central Government, but it may vary slightly for individual state governments.",
  "3. How long for a response?": "By law, the PIO is required to respond to your RTI application within 30 days of receiving it.",
  "4. I want land records.": "Land records are maintained by the Revenue Department or local municipal corporation. You must apply to their PIO.",
  "5. Road repair in my area.": "Road repair falls under the jurisdiction of the Municipal Corporation, PWD, or NHAI depending on the type of road.",
  "6. Hospital doctor info.": "Information about doctors in government hospitals can be requested from the Health Department or the specific hospital's PIO.",
  "7. How to file an appeal?": "If you don't receive a response within 30 days or are unsatisfied, you can file a First Appeal with the First Appellate Authority within the next 30 days.",
  "8. What is RTI Act?": "The Right to Information (RTI) Act is a law that allows any Indian citizen to request information from public authorities to promote transparency."
};

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const Chatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      text: "Hello! I'm your RTI Assistant. I can help you find the right department, understand the RTI process, and guide you through filing requests. How can I help you today?", 
      sender: 'bot',
      isFirstMessage: true 
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => setIsOpen(!isOpen);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch(e) {
          console.error(e);
          setIsListening(false);
        }
      } else {
        alert("Your browser does not support Speech Recognition.");
      }
    }
  };

  const handleQuickQuestionClick = (question) => {
    setMessages(prev => [...prev, { text: question, sender: 'user' }]);
    setIsLoading(true);
    
    setTimeout(() => {
        setIsLoading(false);
        setMessages(prev => [...prev, { 
            text: quickQuestionsData[question], 
            sender: 'bot',
            isQuickQuestionResponse: true 
        }]);
    }, 600);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatbotAPI.chat({ message: userMsg, history: messages });
      setMessages(prev => [...prev, { text: response.data.reply, sender: 'bot' }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now.", sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {!isOpen && (
        <button className="chatbot-toggle" onClick={toggleChat}>
          <FaRobot size={24} />
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window shadow-lg">
          <div className="chatbot-header">
            <div className="header-info">
              <FaRobot size={20} className="mr-2" />
              <span>RTI Assistant</span>
            </div>
            <button className="close-btn" onClick={toggleChat}>
              <FaTimes />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                <div className="message-content">
                  <div dangerouslySetInnerHTML={{__html: msg.text || ''}} />
                  
                  {msg.isFirstMessage && (
                    <div className="quick-questions-container">
                      <div className="quick-questions-title">Quick Questions:</div>
                      {quickQuestionsList.map((q, idx) => (
                        <button key={idx} className="quick-question-btn" onClick={() => handleQuickQuestionClick(q)}>
                          {q}
                        </button>
                      ))}
                    </div>
                  )}

                  {msg.isQuickQuestionResponse && (
                    <div className="chatbot-action-buttons">
                      <button className="action-btn" onClick={() => navigate('/admin/departments')}>🔍 Find Department</button>
                      <button className="action-btn" onClick={() => navigate('/submit-rti')}>📄 Use Template</button>
                      <button className="action-btn" onClick={() => navigate('/submit-rti')}>📝 File RTI Now</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input" onSubmit={handleSend}>
            <button 
              type="button" 
              className={`mic-btn ${isListening ? 'listening' : ''}`}
              onClick={toggleListening}
              title={isListening ? "Stop listening" : "Start Voice Input"}
            >
              {isListening ? <FaStop /> : <FaMicrophone />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about RTI..."
              disabled={isListening}
            />
            <button type="submit" className="send-btn" disabled={!input.trim()}>
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
