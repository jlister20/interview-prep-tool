import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import Document from '../models/Document';
import { OpenAI } from 'openai';

// Initialize OpenAI client or mock if API key is not available
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-preview',
  });
} catch (error) {
  console.warn('OpenAI initialization failed, using mock implementation');
  // Mock implementation for preview purposes
  openai = {
    chat: {
      completions: {
        create: async () => ({
          choices: [{ message: { content: 'This is a mock response for preview purposes.' } }]
        })
      }
    }
  } as any;
}

/**
 * @desc    Upload a document (CV or job specification)
 * @route   POST /api/documents/upload
 * @access  Private
 */
export const uploadDocument = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { type, title, content } = req.body;
    const userId = req.user._id;

    // Check if user already has a document of this type
    const existingDocument = await Document.findOne({ userId, type });

    if (existingDocument) {
      // If a file was uploaded, delete it since we're not going to use it
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(400).json({ 
        message: `You already have a ${type === 'cv' ? 'CV' : 'job specification'} uploaded. Please update or delete it first.` 
      });
    }

    // Create document object
    const documentData: any = {
      userId,
      type,
      title,
      content: content || '',
      status: 'pending'
    };

    // If a file was uploaded, add file information
    if (req.file) {
      documentData.fileUrl = `/uploads/${req.file.filename}`;
      documentData.fileType = path.extname(req.file.originalname).substring(1);
      
      // If no content was provided, extract content from file (simplified here)
      if (!content) {
        // In a real implementation, you would use a library to extract text from the file
        // For now, we'll just use the file name as placeholder content
        documentData.content = `Content extracted from ${req.file.originalname}`;
      }
    }

    // Save document to database
    const document = await Document.create(documentData);

    res.status(201).json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ message: 'Server error during document upload' });
  }
};

/**
 * @desc    Get all documents for the current user
 * @route   GET /api/documents
 * @access  Private
 */
export const getDocuments = async (req: Request, res: Response) => {
  try {
    const documents = await Document.find({ userId: req.user._id });

    res.json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Server error while fetching documents' });
  }
};

/**
 * @desc    Get document by ID
 * @route   GET /api/documents/:id
 * @access  Private
 */
export const getDocumentById = async (req: Request, res: Response) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if the document belongs to the user
    if (document.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this document' });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ message: 'Server error while fetching document' });
  }
};

/**
 * @desc    Update document
 * @route   PUT /api/documents/:id
 * @access  Private
 */
export const updateDocument = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if the document belongs to the user
    if (document.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this document' });
    }

    // Update document fields
    const { title, content } = req.body;
    
    if (title) document.title = title;
    if (content) document.content = content;
    
    // Reset status if content is updated
    if (content) document.status = 'pending';

    // Save updated document
    await document.save();

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ message: 'Server error while updating document' });
  }
};

/**
 * @desc    Delete document
 * @route   DELETE /api/documents/:id
 * @access  Private
 */
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if the document belongs to the user
    if (document.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this document' });
    }

    // If there's a file associated with the document, delete it
    if (document.fileUrl) {
      const filePath = path.join(__dirname, '../../', document.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete document from database
    await document.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Server error while deleting document' });
  }
};

/**
 * @desc    Process document with AI
 * @route   POST /api/documents/:id/process
 * @access  Private
 */
export const processDocument = async (req: Request, res: Response) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if the document belongs to the user
    if (document.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to process this document' });
    }

    // Check if document has content
    if (!document.content) {
      return res.status(400).json({ message: 'Document has no content to process' });
    }

    try {
      // Process document with OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that helps analyze ${document.type === 'cv' ? 'CVs/resumes' : 'job specifications'} for interview preparation.`
          },
          {
            role: "user",
            content: `Please analyze this ${document.type === 'cv' ? 'CV/resume' : 'job specification'} and extract key information: ${document.content}`
          }
        ],
        max_tokens: 500
      });

      // Update document status
      document.status = 'processed';
      await document.save();

      res.json({
        success: true,
        data: {
          document,
          analysis: completion.choices[0].message.content
        }
      });
    } catch (error) {
      console.error('AI processing error:', error);
      
      // Update document with error
      document.status = 'error';
      document.processingError = 'Error processing document with AI';
      await document.save();
      
      return res.status(500).json({ message: 'Error processing document with AI' });
    }
  } catch (error) {
    console.error('Process document error:', error);
    res.status(500).json({ message: 'Server error while processing document' });
  }
};
