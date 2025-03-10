import express from 'express';
import { body } from 'express-validator';
import { 
  getUserProfile, 
  updateUserProfile, 
  deleteUser 
} from '../controllers/user.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user profile
router.get('/profile', getUserProfile);

// Update user profile
router.put(
  '/profile',
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please include a valid email'),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  updateUserProfile
);

// Delete user (only accessible by the user themselves or an admin)
router.delete(
  '/:id',
  authorize('admin'),
  deleteUser
);

export default router;
