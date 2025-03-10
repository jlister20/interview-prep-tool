import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';
import Interview from '../models/Interview';
import Document from '../models/Document';

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
 * @desc    Create a new interview session
 * @route   POST /api/interviews/sessions
 * @access  Private
 */
export const createInterviewSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { title, questionIds } = req.body;

    // If questionIds are provided, use them to create the session
    // Otherwise, generate questions based on user's documents
    let questions = [];

    if (questionIds && questionIds.length > 0) {
      // Use provided question IDs
      // In a real implementation, you would fetch these questions from a database
      questions = questionIds.map((id: string) => ({
        text: `Question with ID ${id}`,
        category: 'general',
        difficulty: 'medium',
        source: 'general'
      }));
    } else {
      // Generate questions based on user's documents
      const generatedQuestions = await generateQuestionsFromDocuments(userId);
      questions = generatedQuestions;
    }

    // Create new interview session
    const interviewSession = await Interview.create({
      userId,
      title: title || `Interview Session - ${new Date().toLocaleDateString()}`,
      questions,
      responses: [],
      status: 'in-progress',
      startTime: new Date()
    });

    res.status(201).json({
      success: true,
      data: interviewSession
    });
  } catch (error) {
    console.error('Create interview session error:', error);
    res.status(500).json({ message: 'Server error during interview session creation' });
  }
};

/**
 * @desc    Generate questions based on user documents
 * @route   POST /api/interviews/questions/generate
 * @access  Private
 */
export const generateQuestions = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { count = 10, difficulty, categories } = req.body;

    const questions = await generateQuestionsFromDocuments(userId, count, difficulty, categories);

    res.json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    console.error('Generate questions error:', error);
    res.status(500).json({ message: 'Server error during question generation' });
  }
};

/**
 * @desc    Get all interview sessions for the current user
 * @route   GET /api/interviews/sessions
 * @access  Private
 */
export const getInterviewSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await Interview.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    console.error('Get interview sessions error:', error);
    res.status(500).json({ message: 'Server error while fetching interview sessions' });
  }
};

/**
 * @desc    Get interview session by ID
 * @route   GET /api/interviews/sessions/:id
 * @access  Private
 */
export const getInterviewSessionById = async (req: Request, res: Response) => {
  try {
    const session = await Interview.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    // Check if the session belongs to the user
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this interview session' });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Get interview session error:', error);
    res.status(500).json({ message: 'Server error while fetching interview session' });
  }
};

/**
 * @desc    Save response to a question
 * @route   POST /api/interviews/sessions/:sessionId/responses
 * @access  Private
 */
export const saveResponse = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { questionId, transcription, duration } = req.body;

    const session = await Interview.findById(sessionId);

    if (!session) {
      // If a file was uploaded, delete it since we're not going to use it
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(404).json({ message: 'Interview session not found' });
    }

    // Check if the session belongs to the user
    if (session.userId.toString() !== req.user._id.toString()) {
      // If a file was uploaded, delete it since we're not going to use it
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(403).json({ message: 'Not authorized to update this interview session' });
    }

    // Create response object
    const responseData: any = {
      questionId,
      transcription,
      duration
    };

    // If audio file was uploaded, add file URL
    if (req.file) {
      responseData.audioUrl = `/uploads/audio/${req.file.filename}`;
    }

    // Check if response already exists for this question
    const existingResponseIndex = session.responses.findIndex(
      (response) => response.questionId.toString() === questionId
    );

    if (existingResponseIndex !== -1) {
      // Update existing response
      session.responses[existingResponseIndex] = {
        ...session.responses[existingResponseIndex],
        ...responseData
      };
    } else {
      // Add new response
      session.responses.push(responseData);
    }

    // Save updated session
    await session.save();

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Save response error:', error);
    res.status(500).json({ message: 'Server error while saving response' });
  }
};

/**
 * @desc    End interview session
 * @route   PUT /api/interviews/sessions/:id/end
 * @access  Private
 */
export const endInterviewSession = async (req: Request, res: Response) => {
  try {
    const session = await Interview.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    // Check if the session belongs to the user
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this interview session' });
    }

    // Update session status and end time
    session.status = 'completed';
    session.endTime = new Date();

    // Save updated session
    await session.save();

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('End interview session error:', error);
    res.status(500).json({ message: 'Server error while ending interview session' });
  }
};

/**
 * Helper function to generate questions based on user documents
 */
const generateQuestionsFromDocuments = async (
  userId: any,
  count = 10,
  difficulty?: string,
  categories?: string[]
) => {
  // Get user's CV and job specification
  const cv = await Document.findOne({ userId, type: 'cv' });
  const jobSpec = await Document.findOne({ userId, type: 'jobSpec' });

  if (!cv && !jobSpec) {
    throw new Error('No CV or job specification found. Please upload at least one document.');
  }

  // Prepare prompt for OpenAI
  let prompt = 'Generate interview questions based on the following information:\n\n';
  
  if (cv) {
    prompt += `CV/Resume: ${cv.content}\n\n`;
  }
  
  if (jobSpec) {
    prompt += `Job Specification: ${jobSpec.content}\n\n`;
  }
  
  prompt += `Please generate ${count} interview questions that are relevant to the candidate's experience and the job requirements. `;
  
  if (difficulty) {
    prompt += `The questions should be of ${difficulty} difficulty. `;
  }
  
  if (categories && categories.length > 0) {
    prompt += `Focus on the following categories: ${categories.join(', ')}. `;
  }
  
  prompt += 'Format the output as a JSON array of objects with the following properties: text, category, difficulty, source.';

  try {
    // Generate questions with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that helps generate relevant interview questions based on a candidate's CV and job specifications."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });

    // Parse the response
    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('Failed to generate questions');
    }

    // Extract JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse generated questions');
    }

    const questions = JSON.parse(jsonMatch[0]);
    
    // Ensure we have the correct format
    return questions.map((q: any) => ({
      text: q.text,
      category: q.category || 'general',
      difficulty: q.difficulty || 'medium',
      source: q.source || 'general'
    })).slice(0, count);
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Return some default questions if API call fails
    return [
      {
        text: 'Tell me about yourself and your background.',
        category: 'general',
        difficulty: 'easy',
        source: 'general'
      },
      {
        text: 'What are your greatest strengths and weaknesses?',
        category: 'personal',
        difficulty: 'medium',
        source: 'general'
      },
      {
        text: 'Why are you interested in this position?',
        category: 'motivation',
        difficulty: 'medium',
        source: 'general'
      },
      {
        text: 'Describe a challenging situation you faced and how you handled it.',
        category: 'behavioral',
        difficulty: 'medium',
        source: 'general'
      },
      {
        text: 'Where do you see yourself in five years?',
        category: 'career',
        difficulty: 'medium',
        source: 'general'
      }
    ];
  }
};
