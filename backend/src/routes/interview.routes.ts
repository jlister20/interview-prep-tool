import express from 'express';
import { 
  createInterviewSession, 
  getInterviewSessions, 
  getInterviewSessionById, 
  saveResponse,
  endInterviewSession,
  generateQuestions
} from '../controllers/interview.controller';
import { protect } from '../middleware/auth.middleware';
import multer from 'multer';

// Configure multer storage for audio uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/audio/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Initialize multer upload
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create a new interview session
router.post('/sessions', createInterviewSession);

// Generate questions based on user documents
router.post('/questions/generate', generateQuestions);

// Get all interview sessions for current user
router.get('/sessions', getInterviewSessions);

// Get interview session by ID
router.get('/sessions/:id', getInterviewSessionById);

// Save response to a question
router.post(
  '/sessions/:sessionId/responses',
  upload.single('audio'),
  saveResponse
);

// End interview session
router.put('/sessions/:id/end', endInterviewSession);

export default router;
