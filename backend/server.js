const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// ========== TEST ROUTE ADDED HERE ==========
// Simple test route to check if server is running
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is working properly!',
    timestamp: new Date().toISOString()
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rti-connect', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected successfully');
  initializeDatabase();
})
.catch(err => console.log('MongoDB connection error:', err));

// Initialize database with default data
async function initializeDatabase() {
  try {
    const Department = require('./models/Department');
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');

    // Check if departments exist
    const deptCount = await Department.countDocuments();
    if (deptCount === 0) {
      const departments = [
        {
          name: 'Municipal Corporation',
          description: 'Handles local civic issues, property tax, water supply, sanitation',
          keywords: ['water', 'tax', 'property', 'sanitation', 'garbage', 'road', 'building', 'municipal', 'civic'],
          language: 'en'
        },
        {
          name: 'నగరపాలక సంస్థ',
          description: 'స్థానిక పౌర సమస్యలు, ఆస్తి పన్ను, నీటి సరఫరా, పారిశుధ్యం',
          keywords: ['నీరు', 'పన్ను', 'ఆస్తి', 'పారిశుధ్యం', 'చెత్త', 'రోడ్డు', 'భవనం'],
          language: 'te'
        },
        {
          name: 'Revenue Department',
          description: 'Land records, property registration, stamp duty',
          keywords: ['land', 'property', 'registration', 'stamp', 'revenue', 'agriculture', 'record'],
          language: 'en'
        },
        {
          name: 'ఆదాయ శాఖ',
          description: 'భూ రికార్డులు, ఆస్తి నమోదు, స్టాంపు డ్యూటీ',
          keywords: ['భూమి', 'ఆస్తి', 'నమోదు', 'స్టాంపు', 'ఆదాయం', 'వ్యవసాయం'],
          language: 'te'
        },
        {
          name: 'Police Department',
          description: 'Law enforcement, crime reports, public safety',
          keywords: ['crime', 'police', 'safety', 'theft', 'complaint', 'security', 'law'],
          language: 'en'
        },
        {
          name: 'పోలీస్ శాఖ',
          description: 'చట్టాన్ని అమలు చేయడం, నేర నివేదికలు, ప్రజా భద్రత',
          keywords: ['నేరం', 'పోలీస్', 'భద్రత', 'దొంగతనం', 'ఫిర్యాదు'],
          language: 'te'
        },
        {
          name: 'Education Department',
          description: 'Schools, colleges, scholarships, educational policies',
          keywords: ['school', 'college', 'education', 'student', 'teacher', 'scholarship', 'exam'],
          language: 'en'
        },
        {
          name: 'విద్యా శాఖ',
          description: 'పాఠశాలలు, కళాశాలలు, స్కాలర్షిప్లు, విద్యా విధానాలు',
          keywords: ['పాఠశాల', 'కళాశాల', 'విద్య', 'విద్యార్థి', 'ఉపాధ్యాయుడు', 'స్కాలర్షిప్'],
          language: 'te'
        },
        {
          name: 'Health Department',
          description: 'Hospitals, healthcare services, medical facilities',
          keywords: ['health', 'hospital', 'medical', 'doctor', 'treatment', 'medicine', 'clinic'],
          language: 'en'
        },
        {
          name: 'ఆరోగ్య శాఖ',
          description: 'ఆసుపత్రులు, ఆరోగ్య సేవలు, వైద్య సౌకర్యాలు',
          keywords: ['ఆరోగ్యం', 'ఆసుపత్రి', 'వైద్య', 'డాక్టర్', 'చికిత్స', 'మందు'],
          language: 'te'
        },
        {
          name: 'Transport Department',
          description: 'Road transport, vehicle registration, driving licenses',
          keywords: ['transport', 'vehicle', 'license', 'driving', 'registration', 'road', 'RTO'],
          language: 'en'
        },
        {
          name: 'రవాణా శాఖ',
          description: 'రోడ్డు రవాణా, వాహన నమోదు, డ్రైవింగ్ లైసెన్స్',
          keywords: ['రవాణా', 'వాహనం', 'లైసెన్స్', 'డ్రైవింగ్', 'నమోదు', 'రోడ్డు'],
          language: 'te'
        },
        {
          name: 'Electricity Board',
          description: 'Power supply, electricity bills, connections',
          keywords: ['electricity', 'power', 'bill', 'connection', 'meter', 'voltage', 'current'],
          language: 'en'
        },
        {
          name: 'విద్యుత్ బోర్డు',
          description: 'విద్యుత్ సరఫరా, విద్యుత్ బిల్లులు, కనెక్షన్లు',
          keywords: ['విద్యుత్', 'పవర్', 'బిల్లు', 'కనెక్షన్', 'మీటర్', 'వోల్టేజ్'],
          language: 'te'
        }
      ];

      for (const dept of departments) {
        await Department.create(dept);
      }
      console.log('Departments initialized');
    }

    // Create admin user if not exists
    const adminExists = await User.findOne({ email: 'admin@rti.gov.in' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await User.create({
        name: 'System Administrator',
        email: 'admin@rti.gov.in',
        password: hashedPassword,
        phone: '9999999999',
        role: 'admin',
        address: {
          street: 'Secretariat',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500001'
        }
      });
      console.log('Admin user created');
    }

    // Create sample PIO users
    const pioExists = await User.findOne({ email: 'pio@municipal.gov.in' });
    if (!pioExists) {
      const hashedPassword = await bcrypt.hash('Pio@123', 10);
      await User.create({
        name: 'Rajesh Kumar',
        email: 'pio@municipal.gov.in',
        password: hashedPassword,
        phone: '8888888888',
        role: 'pio',
        department: 'Municipal Corporation',
        address: {
          street: 'Municipal Office',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500001'
        }
      });
      console.log('PIO user created');
    }

  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/rti', require('./routes/rti'));
app.use('/api/pio', require('./routes/pio'));
app.use('/api/appeals', require('./routes/appeals'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/chatbot', require('./routes/chatbot'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});