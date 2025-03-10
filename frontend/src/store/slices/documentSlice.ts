import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { documentAPI } from '../../services/api';

// Types
interface Document {
  id: string;
  type: 'cv' | 'jobSpec';
  fileName: string;
  fileUrl: string;
  uploadDate: string;
  textContent?: string;
}

export interface DocumentState {
  cv: Document | null;
  jobSpec: Document | null;
  loading: boolean;
  error: string | null;
  processingStatus: 'idle' | 'processing' | 'completed' | 'failed';
}

// Initial state
const initialState: DocumentState = {
  cv: null,
  jobSpec: null,
  loading: false,
  error: null,
  processingStatus: 'idle',
};

// Async thunks
export const uploadDocument = createAsyncThunk(
  'document/upload',
  async (
    { file, type }: { file: File; type: 'cv' | 'jobSpec' },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await documentAPI.uploadDocument(formData);
      return { ...response.data.data, type };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Upload failed');
    }
  }
);

export const getDocuments = createAsyncThunk(
  'document/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await documentAPI.getDocuments();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch documents');
    }
  }
);

export const processDocuments = createAsyncThunk(
  'document/process',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      if (!state.document.cv || !state.document.jobSpec) {
        return rejectWithValue('Both CV and job specification are required');
      }

      const cvId = state.document.cv.id;
      const response = await documentAPI.processDocument(cvId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Processing failed');
    }
  }
);

// Slice
const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    clearDocumentError: (state) => {
      state.error = null;
    },
    resetProcessingStatus: (state) => {
      state.processingStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload document
      .addCase(uploadDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.type === 'cv') {
          state.cv = action.payload;
        } else if (action.payload.type === 'jobSpec') {
          state.jobSpec = action.payload;
        }
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get documents
      .addCase(getDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDocuments.fulfilled, (state, action) => {
        state.loading = false;
        
        const documents = action.payload.data || [];
        const cv = documents.find((doc: Document) => doc.type === 'cv');
        const jobSpec = documents.find((doc: Document) => doc.type === 'jobSpec');
        
        if (cv) state.cv = cv;
        if (jobSpec) state.jobSpec = jobSpec;
      })
      .addCase(getDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Process documents
      .addCase(processDocuments.pending, (state) => {
        state.processingStatus = 'processing';
        state.error = null;
      })
      .addCase(processDocuments.fulfilled, (state) => {
        state.processingStatus = 'completed';
      })
      .addCase(processDocuments.rejected, (state, action) => {
        state.processingStatus = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { clearDocumentError, resetProcessingStatus } = documentSlice.actions;

export default documentSlice.reducer;
