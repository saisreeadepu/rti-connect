const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

// Get all departments
router.get('/', async (req, res) => {
  try {
    const { language } = req.query;
    const query = { isActive: true };
    
    if (language) {
      query.language = language;
    }

    const departments = await Department.find(query)
      .select('name description keywords stats language')
      .populate('pios', 'name email')
      .populate('appellateAuthority', 'name email');
      
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Smart department recommendation
router.post('/recommend', async (req, res) => {
  try {
    const { query, language = 'en' } = req.body;
    
    if (!query || query.trim().length < 3) {
      return res.json([]);
    }

    const searchQuery = query.toLowerCase().trim();
    
    // Find departments matching keywords in query
    const departments = await Department.find({
      isActive: true,
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { keywords: { $in: [new RegExp(searchQuery, 'i')] } }
      ]
    }).select('name description keywords language');

    // Score and rank departments
    const scored = departments.map(dept => {
      let score = 0;
      const deptName = dept.name.toLowerCase();
      const deptDesc = dept.description?.toLowerCase() || '';
      
      // Name match (highest weight)
      if (deptName.includes(searchQuery)) {
        score += 10;
        // Exact match gets bonus
        if (deptName === searchQuery) score += 5;
      }
      
      // Keyword matches
      dept.keywords.forEach(keyword => {
        if (keyword.toLowerCase().includes(searchQuery)) {
          score += 8;
        }
        if (searchQuery.includes(keyword.toLowerCase())) {
          score += 6;
        }
      });
      
      // Description match
      if (deptDesc.includes(searchQuery)) {
        score += 3;
      }
      
      return {
        ...dept.toObject(),
        score,
        matchType: score >= 10 ? 'high' : score >= 5 ? 'medium' : 'low'
      };
    });

    // Filter out low relevance and sort by score
    const recommendations = scored
      .filter(dept => dept.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Top 5 recommendations

       res.json(recommendations);
  } catch (error) {
    console.error('Department recommendation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get department by name
router.get('/:name', async (req, res) => {
  try {
    const department = await Department.findOne({ 
      name: req.params.name,
      isActive: true 
    })
    .populate('pios', 'name email phone')
    .populate('appellateAuthority', 'name email');

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json(department);
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Create department
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, description, keywords, language, contactInfo } = req.body;

    // Check if department exists
    const existingDept = await Department.findOne({ name });
    if (existingDept) {
      return res.status(400).json({ message: 'Department already exists' });
    }

    const department = new Department({
      name,
      description,
      keywords: keywords || [],
      language: language || 'en',
      contactInfo
    });

    await department.save();
    res.status(201).json({ message: 'Department created successfully', department });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update department
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, description, keywords, language, contactInfo, isActive } = req.body;
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    if (name) department.name = name;
    if (description) department.description = description;
    if (keywords) department.keywords = keywords;
    if (language) department.language = language;
    if (contactInfo) department.contactInfo = contactInfo;
    if (isActive !== undefined) department.isActive = isActive;

    department.updatedAt = new Date();
    await department.save();

    res.json({ message: 'Department updated successfully', department });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Assign PIO to department
router.post('/:id/assign-pio', auth, authorize('admin'), async (req, res) => {
  try {
    const { pioId } = req.body;
    const department = await Department.findById(req.params.id);
    const pio = await User.findById(pioId);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    if (!pio || pio.role !== 'pio') {
      return res.status(400).json({ message: 'Invalid PIO' });
    }

    // Check if PIO already assigned
    if (!department.pios.includes(pioId)) {
      department.pios.push(pioId);
      await department.save();
    }

    // Update PIO's department
    pio.department = department.name;
    await pio.save();

    res.json({ message: 'PIO assigned successfully', department });
  } catch (error) {
    console.error('Assign PIO error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Remove PIO from department
router.delete('/:id/remove-pio/:pioId', auth, authorize('admin'), async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    const pio = await User.findById(req.params.pioId);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    department.pios = department.pios.filter(p => p.toString() !== req.params.pioId);
    await department.save();

    if (pio && pio.department === department.name) {
      pio.department = null;
      await pio.save();
    }

    res.json({ message: 'PIO removed successfully' });
  } catch (error) {
    console.error('Remove PIO error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Assign appellate authority
router.post('/:id/assign-appellate', auth, authorize('admin'), async (req, res) => {
  try {
    const { appellateId } = req.body;
    const department = await Department.findById(req.params.id);
    const appellate = await User.findById(appellateId);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    if (!appellate || appellate.role !== 'appellate') {
      return res.status(400).json({ message: 'Invalid appellate authority' });
    }

    department.appellateAuthority = appellateId;
    await department.save();

    // Update appellate's department
    appellate.department = department.name;
    await appellate.save();

    res.json({ message: 'Appellate authority assigned successfully', department });
  } catch (error) {
    console.error('Assign appellate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get department statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    await department.updateStats();
    res.json(department.stats);
  } catch (error) {
    console.error('Get department stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;