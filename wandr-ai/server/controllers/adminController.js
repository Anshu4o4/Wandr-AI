import User from '../models/User.js';
import Trip from '../models/Trip.js';
import Booking from '../models/Booking.js';
import logger from '../utils/logger.js';

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/v1/admin/stats
 * @access  Private/Admin
 */
export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTrips = await Trip.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // Calculate total revenue from paid bookings
    const revenueData = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Get recent activity
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalUsers,
          totalTrips,
          totalBookings,
          totalRevenue
        },
        recentActivity: {
          bookings: recentBookings,
          users: recentUsers
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching admin stats', { error: error.message, stack: error.stack });
    next(error);
  }
};

/**
 * @desc    Get all users (with pagination)
 * @route   GET /api/v1/admin/users
 * @access  Private/Admin
 */
export const getAllUsersAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    const total = await User.countDocuments();

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users },
      pagination: {
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};
