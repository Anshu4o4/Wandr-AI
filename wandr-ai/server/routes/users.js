import express from 'express';
import * as userController from '../controllers/userController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Current User Routes
router.patch('/updateMe', userController.updateMe);
router.post('/save-itinerary', userController.saveItinerary);
router.get('/my-itineraries', userController.getMyItineraries);
router.post('/toggle-save-trip', userController.toggleSaveTrip);
router.get('/saved-trips', userController.getSavedTrips);

// Admin Only Routes
router.use(restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUserRole)
  .delete(userController.deleteUser);

export default router;
