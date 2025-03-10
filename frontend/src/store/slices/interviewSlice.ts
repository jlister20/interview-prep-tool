import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { interviewAPI } from '../../services/api';

// Types
interface Question {
  id: string;
  text: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface InterviewSession {
  id: string;
  userId: string;
  questions: Question[];
  startTime: string;
  endTime?: string;
  status: 'pending' | 'in-progress' | 'completed';
}

interface Response {
  id: string;
  questionId: string;
  audioUrl?: string;
  transcription?: string;
  duration?: number;
}

interface InterviewState {
  currentSession: InterviewSession | null;
  currentQuestion: Question | null;
  currentQuestionIndex: number;
  responses: Record<string, Response>;
  loading: boolean;
  error: string | null;
  audioRecording: boolean;
  audioPlaying: boolean;
  speechRecognitionActive: boolean;
}

// Initial state
const initialState: InterviewState = {
  currentSession: null,
  currentQuestion: null,
  currentQuestionIndex: 0,
  responses: {},
  loading: false,
  error: null,
  audioRecording: false,
  audioPlaying: false,
  speechRecognitionActive: false,
};

// Async thunks
export const startInterviewSession = createAsyncThunk(
  'interview/startSession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await interviewAPI.createSession({});
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start interview session');
    }
  }
);

export const endInterviewSession = createAsyncThunk(
  'interview/endSession',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const response = await interviewAPI.endSession(sessionId);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to end interview session');
    }
  }
);

export const saveResponse = createAsyncThunk(
  'interview/saveResponse',
  async (
    { 
      sessionId, 
      questionId, 
      audioBlob, 
      transcription 
    }: { 
      sessionId: string; 
      questionId: string; 
      audioBlob?: Blob; 
      transcription?: string 
    }, 
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append('questionId', questionId);
      
      if (audioBlob) {
        formData.append('audio', audioBlob, 'response.webm');
      }
      
      if (transcription) {
        formData.append('transcription', transcription);
      }

      const response = await interviewAPI.saveResponse(sessionId, formData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save response');
    }
  }
);

// Slice
const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setCurrentQuestion: (state, action) => {
      const index = action.payload;
      if (state.currentSession && index >= 0 && index < state.currentSession.questions.length) {
        state.currentQuestionIndex = index;
        state.currentQuestion = state.currentSession.questions[index];
      }
    },
    nextQuestion: (state) => {
      if (state.currentSession && state.currentQuestionIndex < state.currentSession.questions.length - 1) {
        state.currentQuestionIndex += 1;
        state.currentQuestion = state.currentSession.questions[state.currentQuestionIndex];
      }
    },
    previousQuestion: (state) => {
      if (state.currentSession && state.currentQuestionIndex > 0) {
        state.currentQuestionIndex -= 1;
        state.currentQuestion = state.currentSession.questions[state.currentQuestionIndex];
      }
    },
    setAudioRecording: (state, action) => {
      state.audioRecording = action.payload;
    },
    setAudioPlaying: (state, action) => {
      state.audioPlaying = action.payload;
    },
    setSpeechRecognitionActive: (state, action) => {
      state.speechRecognitionActive = action.payload;
    },
    clearInterviewError: (state) => {
      state.error = null;
    },
    resetInterview: (state) => {
      state.currentSession = null;
      state.currentQuestion = null;
      state.currentQuestionIndex = 0;
      state.responses = {};
      state.audioRecording = false;
      state.audioPlaying = false;
      state.speechRecognitionActive = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Start interview session
      .addCase(startInterviewSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startInterviewSession.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
        state.currentQuestion = action.payload.questions[0];
        state.currentQuestionIndex = 0;
        state.responses = {};
      })
      .addCase(startInterviewSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // End interview session
      .addCase(endInterviewSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(endInterviewSession.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
      })
      .addCase(endInterviewSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Save response
      .addCase(saveResponse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveResponse.fulfilled, (state, action) => {
        state.loading = false;
        state.responses = {
          ...state.responses,
          [action.payload.questionId]: action.payload,
        };
      })
      .addCase(saveResponse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentQuestion,
  nextQuestion,
  previousQuestion,
  setAudioRecording,
  setAudioPlaying,
  setSpeechRecognitionActive,
  clearInterviewError,
  resetInterview,
} = interviewSlice.actions;

export default interviewSlice.reducer;
