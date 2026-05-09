import User from '../models/User.js';
import logger from '../utils/logger.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find().skip(skip).limit(Number(limit));
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
    logger.error(error.message, { stack: error.stack, route: req.originalUrl });
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    logger.error(error.message, { stack: error.stack, route: req.originalUrl });
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ status: 'error', message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    logger.error(error.message, { stack: error.stack, route: req.originalUrl });
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};
export const updateMe = async (req, res, next) => {
  try {
    // 1) Filter out unwanted fields that are not allowed to be updated
    const filteredBody = {};
    if (req.body.name) filteredBody.name = req.body.name;
    if (req.body.email) filteredBody.email = req.body.email;
    if (req.body.avatar) filteredBody.avatar = req.body.avatar;

    // 2) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: { user: updatedUser }
    });
  } catch (error) {
    logger.error(error.message, { stack: error.stack, userId: req.user?._id, route: req.originalUrl });
    next(error);
  }
};

export const saveItinerary = async (req, res, next) => {
  try {
    const { itinerary } = req.body;
    if (!itinerary) {
      return res.status(400).json({ status: 'error', message: 'Itinerary data is required' });
    }

    const user = await User.findById(req.user.id);
    user.savedItineraries.push(itinerary);
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'Itinerary saved to profile',
      data: null
    });
  } catch (error) {
    logger.error(error.message, { stack: error.stack, userId: req.user?._id, route: req.originalUrl });
    next(error);
  }
};

export const getMyItineraries = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('savedItineraries');
    res.status(200).json({
      status: 'success',
      data: { itineraries: user.savedItineraries }
    });
  } catch (error) {
    next(error);
  }
};
export const toggleSaveTrip = async (req, res, next) => {
  try {
    const { tripId } = req.body;
    if (!tripId) {
      return res.status(400).json({ status: 'error', message: 'Trip ID is required' });
    }

    const user = await User.findById(req.user.id);
    const isSaved = user.savedTrips.some(id => id.toString() === tripId);

    if (isSaved) {
      user.savedTrips.pull(tripId);
    } else {
      user.savedTrips.addToSet(tripId);
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: isSaved ? 'Trip removed from wishlist' : 'Trip added to wishlist',
      data: { isSaved: !isSaved }
    });
  } catch (error) {
    logger.error(error.message, { stack: error.stack, userId: req.user?._id, route: req.originalUrl });
    next(error);
  }
};

export const getSavedTrips = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('savedTrips');
    res.status(200).json({
      status: 'success',
      data: { trips: user.savedTrips }
    });
  } catch (error) {
    next(error);
  }
};
