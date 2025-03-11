import express from 'express';
import { body } from 'express-validator';
import { 
  uploadDocument, 
  getDocuments, 
  getDocumentById, 
  updateDocument, 
  deleteDocument,
  processDocument
} from '../controllers/document.controller';
import { protect } from '../middleware/auth.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define uploads directory with absolute path
const uploadsDir = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Created uploads directory at: ${uploadsDir}`);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter for allowed file types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedFileTypes = ['.pdf', '.doc', '.docx', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
  }
};

// Initialize multer upload
const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const router = express.Router();

// All routes require authentication
router.use(protect);

// Upload document (CV or job specification)
router.post(
  '/upload',
  upload.single('file'),
  [
    body('type').isIn(['cv', 'jobSpec']).withMessage('Document type must be either cv or jobSpec'),
    body('title').notEmpty().withMessage('Document title is required')
  ],
  uploadDocument
);

// Get all documents for current user
router.get('/', getDocuments);

// Get document by ID
router.get('/:id', getDocumentById);

// Update document
router.put(
  '/:id',
  [
    body('title').optional().notEmpty().withMessage('Document title cannot be empty'),
    body('content').optional().notEmpty().withMessage('Document content cannot be empty')
  ],
  updateDocument
);

// Delete document
router.delete('/:id', deleteDocument);

// Process document with AI
router.post('/:id/process', processDocument);

export default router;
