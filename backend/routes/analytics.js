const express = require('express');
const router = express.Router();
const RTIRequest = require('../models/RTIRequest');
const Department = require('../models/Department');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

// Get analytics dashboard data
router.get('/dashboard', auth, authorize('admin'), async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Overall statistics
    const totalRequests = await RTIRequest.countDocuments();
    const resolvedRequests = await RTIRequest.countDocuments({ 
      status: { $in: ['replied', 'rejected', 'closed'] } 
    });
    const pendingRequests = await RTIRequest.countDocuments({ 
      status: { $in: ['submitted', 'fee-pending', 'fee-paid', 'under-review', 'forwarded'] } 
    });
    const appealedRequests = await RTIRequest.countDocuments({ 
      'appeal.filed': true 
    });

    // Monthly statistics
    const monthlyRequests = await RTIRequest.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    const monthlyResolved = await RTIRequest.countDocuments({
      'response.respondedAt': { $gte: startOfMonth }
    });

    // Yearly statistics
    const yearlyRequests = await RTIRequest.countDocuments({
      createdAt: { $gte: startOfYear }
    });

    // Status breakdown
    const statusBreakdown = await RTIRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = await RTIRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          submitted: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [
                { $in: ['$status', ['replied', 'rejected', 'closed']] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format monthly trends
    const formattedTrends = monthlyTrends.map(item => ({
      month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
      submitted: item.submitted,
      resolved: item.resolved
    }));

    // Department performance
    const departmentPerformance = await Department.aggregate([
      {
        $project: {
          name: 1,
          totalRequests: '$stats.totalRequests',
          resolvedRequests: '$stats.resolvedRequests',
          pendingRequests: '$stats.pendingRequests',
          avgResponseTime: '$stats.averageResponseTime',
          onTimeResponses: '$stats.onTimeResponses',
          delayedResponses: '$stats.delayedResponses'
        }
      },
      { $sort: { totalRequests: -1 } }
    ]);

    // Response time analysis
    const responseTimes = await RTIRequest.aggregate([
      {
        $match: {
          'response.respondedAt': { $exists: true }
        }
      },
      {
        $project: {
          department: 1,
          responseTime: {
            $divide: [
              { $subtract: ['$response.respondedAt', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: '$department',
          avgResponseTime: { $avg: '$responseTime' },
          minResponseTime: { $min: '$responseTime' },
          maxResponseTime: { $max: '$responseTime' },
          count: { $sum: 1 }
        }
      }
    ]);

    // User statistics
    const userStats = {
      totalCitizens: await User.countDocuments({ role: 'citizen' }),
      totalPIOs: await User.countDocuments({ role: 'pio' }),
      totalAppellate: await User.countDocuments({ role: 'appellate' }),
      activeToday: await User.countDocuments({
        lastLogin: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      })
    };

    // Fee collection statistics
    const feeStats = await RTIRequest.aggregate([
      {
        $match: {
          'feeDetails.status': 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalFees: { $sum: '$feeDetails.amount' },
          totalPayments: { $sum: 1 },
          averageFee: { $avg: '$feeDetails.amount' }
        }
      }
    ]);

    res.json({
      overall: {
        totalRequests,
        resolvedRequests,
        pendingRequests,
        appealedRequests,
        resolutionRate: totalRequests ? ((resolvedRequests / totalRequests) * 100).toFixed(2) : 0,
        monthlyRequests,
        monthlyResolved,
        yearlyRequests
      },
      statusBreakdown,
      monthlyTrends: formattedTrends,
      departmentPerformance,
      responseTimes,
      userStats,
      feeStats: feeStats[0] || { totalFees: 0, totalPayments: 0, averageFee: 0 }
    });
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get department-wise statistics
router.get('/departments', async (req, res) => {
  try {
    const stats = await Department.find()
      .select('name stats')
      .sort({ 'stats.totalRequests': -1 });
    
    const formattedStats = stats.map(dept => ({
      name: dept.name,
      ...dept.stats,
      performance: dept.stats.totalRequests ? 
        ((dept.stats.resolvedRequests / dept.stats.totalRequests) * 100).toFixed(2) : 0
    }));

    res.json(formattedStats);
  } catch (error) {
    console.error('Department stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get time-based analytics
router.get('/time-analysis', auth, authorize('admin'), async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    let groupBy;
    let dateFormat;

    switch(period) {
      case 'day':
        groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        groupBy = { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
        dateFormat = '%Y-W%U';
        break;
      case 'year':
        groupBy = { year: { $year: '$createdAt' } };
        dateFormat = '%Y';
        break;
      default: // month
        groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
        dateFormat = '%Y-%m';
    }

    const requests = await RTIRequest.aggregate([
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    const responses = await RTIRequest.aggregate([
      {
        $match: {
          'response.respondedAt': { $exists: true }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$response.respondedAt' },
            month: { $month: '$response.respondedAt' },
            ...(period === 'day' && { day: { $dayOfMonth: '$response.respondedAt' } })
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({
      period,
      requests,
      responses
    });
  } catch (error) {
    console.error('Time analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get citizen statistics
router.get('/citizen/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check authorization
    if (req.user.role !== 'admin' && req.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const stats = await RTIRequest.aggregate([
      {
        $match: { citizen: mongoose.Types.ObjectId(userId) }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await RTIRequest.countDocuments({ citizen: userId });
    const resolved = await RTIRequest.countDocuments({ 
      citizen: userId,
      status: { $in: ['replied', 'rejected', 'closed'] }
    });
    const pending = await RTIRequest.countDocuments({ 
      citizen: userId,
      status: { $in: ['submitted', 'fee-pending', 'fee-paid', 'under-review', 'forwarded'] }
    });
    const appealed = await RTIRequest.countDocuments({ 
      citizen: userId,
      'appeal.filed': true 
    });

    // Get monthly trend for this citizen
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await RTIRequest.aggregate([
      {
        $match: {
          citizen: mongoose.Types.ObjectId(userId),
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      total,
      resolved,
      pending,
      appealed,
      resolutionRate: total ? (resolved / total * 100).toFixed(2) : 0,
      statusBreakdown: stats,
      monthlyTrend
    });
  } catch (error) {
    console.error('Citizen stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export analytics report
router.get('/export', auth, authorize('admin'), async (req, res) => {
  try {
    const { format = 'json', startDate, endDate } = req.query;
    
    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const requests = await RTIRequest.find(query)
      .populate('citizen', 'name email')
      .populate('assignedPIO', 'name email')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Convert to CSV format
      const csv = requests.map(req => ({
        'Request ID': req.requestId,
        'Citizen': req.citizen?.name || 'N/A',
        'Subject': req.subject,
        'Department': req.department,
        'Status': req.status,
        'Submitted': req.createdAt.toISOString().split('T')[0],
        'Responded': req.response?.respondedAt?.toISOString().split('T')[0] || 'Pending',
        'Response Time': req.response?.respondedAt ? 
          Math.round((req.response.respondedAt - req.createdAt) / (1000 * 60 * 60 * 24)) + ' days' : 
          'N/A'
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=rti-report.csv');
      
      // Send CSV headers
      if (csv.length > 0) {
        const headers = Object.keys(csv[0]).join(',');
        const rows = csv.map(row => Object.values(row).join(',')).join('\n');
        res.send(`${headers}\n${rows}`);
      } else {
        res.send('No data found');
      }
    } else {
      res.json(requests);
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;