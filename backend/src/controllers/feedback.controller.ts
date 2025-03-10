import { Request, Response } from 'express';
import { OpenAI } from 'openai';
import Feedback from '../models/Feedback';
import Interview from '../models/Interview';

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
 * @desc    Generate feedback for an interview session
 * @route   POST /api/feedback/generate/:interviewId
 * @access  Private
 */
export const generateFeedback = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;
    const userId = req.user._id;

    // Check if interview exists
    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    // Check if the interview belongs to the user
    if (interview.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this interview session' });
    }

    // Check if interview is completed
    if (interview.status !== 'completed') {
      return res.status(400).json({ message: 'Interview session must be completed before generating feedback' });
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({ interviewId });

    if (existingFeedback) {
      return res.status(400).json({ message: 'Feedback already exists for this interview session' });
    }

    // Check if there are responses to analyze
    if (interview.responses.length === 0) {
      return res.status(400).json({ message: 'No responses found for this interview session' });
    }

    // Generate feedback for each question with a response
    const feedbackItems = [];
    const suggestions = [];

    for (const question of interview.questions) {
      const response = interview.responses.find(
        (r) => r.questionId.toString() === question._id.toString()
      );

      if (response && response.transcription) {
        // Generate feedback for this question-response pair
        const questionFeedback = await generateQuestionFeedback(
          question.text,
          response.transcription
        );

        feedbackItems.push(...questionFeedback.feedbackItems);
        suggestions.push(...questionFeedback.suggestions);
      }
    }

    // Generate overall feedback
    const overallFeedback = await generateOverallFeedback(
      interview.questions,
      interview.responses,
      feedbackItems
    );

    // Create feedback document
    const feedback = await Feedback.create({
      interviewId,
      userId,
      overallScore: overallFeedback.overallScore,
      summary: overallFeedback.summary,
      strengths: overallFeedback.strengths,
      weaknesses: overallFeedback.weaknesses,
      feedbackItems,
      suggestions
    });

    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Generate feedback error:', error);
    res.status(500).json({ message: 'Server error during feedback generation' });
  }
};

/**
 * @desc    Get feedback by interview ID
 * @route   GET /api/feedback/interview/:interviewId
 * @access  Private
 */
export const getFeedbackByInterviewId = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;
    const userId = req.user._id;

    // Check if interview exists
    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    // Check if the interview belongs to the user
    if (interview.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this interview session' });
    }

    // Get feedback
    const feedback = await Feedback.findOne({ interviewId });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found for this interview session' });
    }

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Server error while fetching feedback' });
  }
};

/**
 * @desc    Get feedback by feedback ID
 * @route   GET /api/feedback/:id
 * @access  Private
 */
export const getFeedbackById = async (req: Request, res: Response) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check if the feedback belongs to the user
    if (feedback.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this feedback' });
    }

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Server error while fetching feedback' });
  }
};

/**
 * @desc    Get all feedback for current user
 * @route   GET /api/feedback
 * @access  Private
 */
export const getAllUserFeedback = async (req: Request, res: Response) => {
  try {
    const feedback = await Feedback.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: feedback.length,
      data: feedback
    });
  } catch (error) {
    console.error('Get all feedback error:', error);
    res.status(500).json({ message: 'Server error while fetching feedback' });
  }
};

/**
 * Helper function to generate feedback for a question-response pair
 */
const generateQuestionFeedback = async (question: string, response: string) => {
  try {
    // Prepare prompt for OpenAI
    const prompt = `
      Question: ${question}
      
      Response: ${response}
      
      Please analyze this interview response and provide detailed feedback. 
      Format your response as a JSON object with the following structure:
      {
        "feedbackItems": [
          {
            "category": "content|delivery|language|confidence",
            "sentiment": "positive|negative|neutral",
            "content": "Detailed feedback about the response"
          }
        ],
        "suggestions": [
          {
            "category": "content|delivery|language|confidence",
            "content": "Specific suggestion for improvement"
          }
        ]
      }
    `;

    // Generate feedback with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that provides detailed feedback on interview responses."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    // Parse the response
    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('Failed to generate feedback');
    }

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse generated feedback');
    }

    const feedback = JSON.parse(jsonMatch[0]);
    
    return {
      feedbackItems: feedback.feedbackItems || [],
      suggestions: feedback.suggestions || []
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Return default feedback if API call fails
    return {
      feedbackItems: [
        {
          category: 'content',
          sentiment: 'neutral',
          content: 'We were unable to generate detailed feedback for this response.'
        }
      ],
      suggestions: [
        {
          category: 'content',
          content: 'Consider providing more specific examples in your answer.'
        }
      ]
    };
  }
};

/**
 * Helper function to generate overall feedback for an interview session
 */
const generateOverallFeedback = async (questions: any[], responses: any[], feedbackItems: any[]) => {
  try {
    // Calculate response rate
    const responseRate = responses.length / questions.length;
    
    // Calculate positive feedback ratio
    const positiveFeedback = feedbackItems.filter(item => item.sentiment === 'positive').length;
    const positiveRatio = positiveFeedback / feedbackItems.length;
    
    // Calculate overall score (simplified)
    const overallScore = Math.round((responseRate * 40) + (positiveRatio * 60));
    
    // Extract strengths and weaknesses from feedback items
    const strengths = feedbackItems
      .filter(item => item.sentiment === 'positive')
      .map(item => item.content)
      .slice(0, 5);
    
    const weaknesses = feedbackItems
      .filter(item => item.sentiment === 'negative')
      .map(item => item.content)
      .slice(0, 5);
    
    // If we have OpenAI API access, generate a more personalized summary
    if (process.env.OPENAI_API_KEY) {
      // Prepare prompt for OpenAI
      const prompt = `
        I've analyzed an interview with ${questions.length} questions and ${responses.length} responses.
        The candidate received positive feedback on: ${strengths.join(', ')}
        Areas for improvement include: ${weaknesses.join(', ')}
        The overall score is ${overallScore}/100.
        
        Please generate a concise, personalized summary of this interview performance.
      `;

      // Generate summary with OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that provides constructive feedback on interview performance."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      });

      return {
        overallScore,
        summary: completion.choices[0].message.content || 'Interview feedback summary not available.',
        strengths: strengths.length > 0 ? strengths : ['No specific strengths identified.'],
        weaknesses: weaknesses.length > 0 ? weaknesses : ['No specific areas for improvement identified.']
      };
    }
    
    // Default summary if API is not available
    return {
      overallScore,
      summary: `You completed ${responses.length} out of ${questions.length} questions with an overall score of ${overallScore}/100. Focus on improving the areas highlighted in your feedback.`,
      strengths: strengths.length > 0 ? strengths : ['No specific strengths identified.'],
      weaknesses: weaknesses.length > 0 ? weaknesses : ['No specific areas for improvement identified.']
    };
  } catch (error) {
    console.error('Generate overall feedback error:', error);
    
    // Return default overall feedback if there's an error
    return {
      overallScore: 70,
      summary: 'Thank you for completing the interview practice. We were unable to generate a detailed summary, but you can review individual feedback for each question.',
      strengths: ['Completed the interview session.'],
      weaknesses: ['Consider providing more detailed responses.']
    };
  }
};
