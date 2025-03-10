import express from 'express';
import { 
  generateFeedback,
  getFeedbackByInterviewId,
  getFeedbackById,
  getAllUserFeedback
} from '../controllers/feedback.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Generate feedback for an interview session
router.post('/generate/:interviewId', generateFeedback);

// Get feedback by interview ID
router.get('/interview/:interviewId', getFeedbackByInterviewId);

// Get feedback by feedback ID
router.get('/:id', getFeedbackById);

// Get all feedback for current user
router.get('/', getAllUserFeedback);

export default router;
