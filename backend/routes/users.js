const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    res.json(req.user.getProfile());
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, address, language } = req.body;
    const user = await User.findById(req.userId);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = { ...user.address, ...address };
    if (language) user.language = language;

    await user.save();
    res.json({ message: 'Profile updated successfully', user: user.getProfile() });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all users
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get single user
router.get('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update user
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, email, phone, role, department, isActive, language } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (department) user.department = department;
    if (isActive !== undefined) user.isActive = isActive;
    if (language) user.language = language;

    await user.save();
    res.json({ message: 'User updated successfully', user: user.getProfile() });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Delete user
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Soft delete - deactivate instead of removing
    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get PIOs by department
router.get('/pios/department/:department', auth, async (req, res) => {
  try {
    const pios = await User.find({
      role: 'pio',
      department: req.params.department,
      isActive: true
    }).select('name email phone');
    
    res.json(pios);
  } catch (error) {
    console.error('Get PIOs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;