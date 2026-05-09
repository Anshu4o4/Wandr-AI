import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import * as authController from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password cannot be empty'),
  ],
  validate,
  authController.login
);

router.post('/google', authController.googleAuth);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Protected routes below
router.use(protect);

router.get('/me', authController.getMe);
router.patch('/update-me', authController.updateMe);
router.patch('/change-password', authController.changePassword);

export default router;
