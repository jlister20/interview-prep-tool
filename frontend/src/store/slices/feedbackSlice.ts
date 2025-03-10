import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { feedbackAPI } from '../../services/api';

// Types
interface FeedbackItem {
  id: string;
  questionId: string;
  responseId: string;
  content: string;
  category: 'content' | 'delivery' | 'language' | 'confidence' | 'general';
  sentiment: 'positive' | 'negative' | 'neutral';
  createdAt: string;
}

interface Suggestion {
  id: string;
  questionId: string;
  responseId: string;
  content: string;
  category: 'content' | 'delivery' | 'language' | 'confidence' | 'general';
  createdAt: string;
}

interface SessionFeedback {
  id: string;
  sessionId: string;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  summary: string;
  createdAt: string;
}

interface FeedbackState {
  sessionFeedback: SessionFeedback | null;
  feedbackItems: Record<string, FeedbackItem[]>; // questionId -> feedbackItems
  suggestions: Record<string, Suggestion[]>; // questionId -> suggestions
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: FeedbackState = {
  sessionFeedback: null,
  feedbackItems: {},
  suggestions: {},
  loading: false,
  error: null,
};

// Async thunks
export const getSessionFeedback = createAsyncThunk(
  'feedback/getSessionFeedback',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const response = await feedbackAPI.getFeedbackByInterview(sessionId);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch session feedback');
    }
  }
);

export const getResponseFeedback = createAsyncThunk(
  'feedback/getResponseFeedback',
  async (
    { sessionId, responseId }: { sessionId: string; responseId: string },
    { rejectWithValue }
  ) => {
    try {
      // Since we don't have a specific endpoint for response feedback in our API service,
      // we'll get the entire feedback and filter for the specific response
      const response = await feedbackAPI.getFeedbackByInterview(sessionId);
      const allFeedback = response.data.data;
      
      // Filter feedback items for the specific response
      const feedbackItems = allFeedback.feedbackItems.filter(
        (item: any) => item.responseId === responseId
      );
      
      // Filter suggestions for the specific response
      const suggestions = allFeedback.suggestions.filter(
        (suggestion: any) => suggestion.responseId === responseId
      );
      
      // Get the question ID from the first feedback item (if any)
      const questionId = feedbackItems.length > 0 ? feedbackItems[0].questionId : '';
      
      return { questionId, feedbackItems, suggestions };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch response feedback');
    }
  }
);

export const generateFeedback = createAsyncThunk(
  'feedback/generate',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const response = await feedbackAPI.generateFeedback(sessionId);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate feedback');
    }
  }
);

// Slice
const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    clearFeedbackError: (state) => {
      state.error = null;
    },
    resetFeedback: (state) => {
      state.sessionFeedback = null;
      state.feedbackItems = {};
      state.suggestions = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Get session feedback
      .addCase(getSessionFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSessionFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.sessionFeedback = action.payload.sessionFeedback;
        
        // Organize feedback items by question ID
        const feedbackItems: Record<string, FeedbackItem[]> = {};
        const suggestions: Record<string, Suggestion[]> = {};
        
        action.payload.feedbackItems.forEach((item: FeedbackItem) => {
          if (!feedbackItems[item.questionId]) {
            feedbackItems[item.questionId] = [];
          }
          feedbackItems[item.questionId].push(item);
        });
        
        action.payload.suggestions.forEach((suggestion: Suggestion) => {
          if (!suggestions[suggestion.questionId]) {
            suggestions[suggestion.questionId] = [];
          }
          suggestions[suggestion.questionId].push(suggestion);
        });
        
        state.feedbackItems = feedbackItems;
        state.suggestions = suggestions;
      })
      .addCase(getSessionFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get response feedback
      .addCase(getResponseFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getResponseFeedback.fulfilled, (state, action) => {
        state.loading = false;
        
        const { questionId, feedbackItems, suggestions } = action.payload;
        
        state.feedbackItems = {
          ...state.feedbackItems,
          [questionId]: feedbackItems,
        };
        
        state.suggestions = {
          ...state.suggestions,
          [questionId]: suggestions,
        };
      })
      .addCase(getResponseFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Generate feedback
      .addCase(generateFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.sessionFeedback = action.payload.sessionFeedback;
        
        // Organize feedback items by question ID
        const feedbackItems: Record<string, FeedbackItem[]> = {};
        const suggestions: Record<string, Suggestion[]> = {};
        
        action.payload.feedbackItems.forEach((item: FeedbackItem) => {
          if (!feedbackItems[item.questionId]) {
            feedbackItems[item.questionId] = [];
          }
          feedbackItems[item.questionId].push(item);
        });
        
        action.payload.suggestions.forEach((suggestion: Suggestion) => {
          if (!suggestions[suggestion.questionId]) {
            suggestions[suggestion.questionId] = [];
          }
          suggestions[suggestion.questionId].push(suggestion);
        });
        
        state.feedbackItems = feedbackItems;
        state.suggestions = suggestions;
      })
      .addCase(generateFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearFeedbackError, resetFeedback } = feedbackSlice.actions;

export default feedbackSlice.reducer;
