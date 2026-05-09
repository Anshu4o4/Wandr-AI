import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// All routes here are restricted to admins
router.use(protect);
router.use(restrictTo('admin'));

router.get('/stats', adminController.getAdminStats);
router.get('/users', adminController.getAllUsersAdmin);

export default router;
