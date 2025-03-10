import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedbackItem extends Document {
  questionId: mongoose.Types.ObjectId;
  category: 'content' | 'delivery' | 'language' | 'confidence';
  sentiment: 'positive' | 'negative' | 'neutral';
  content: string;
}

const FeedbackItemSchema = new Schema<IFeedbackItem>({
  questionId: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: [true, 'Question ID is required']
  },
  category: {
    type: String,
    enum: ['content', 'delivery', 'language', 'confidence'],
    required: [true, 'Feedback category is required']
  },
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    required: [true, 'Feedback sentiment is required']
  },
  content: {
    type: String,
    required: [true, 'Feedback content is required']
  }
});

export interface ISuggestion extends Document {
  questionId: mongoose.Types.ObjectId;
  category: 'content' | 'delivery' | 'language' | 'confidence';
  content: string;
}

const SuggestionSchema = new Schema<ISuggestion>({
  questionId: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: [true, 'Question ID is required']
  },
  category: {
    type: String,
    enum: ['content', 'delivery', 'language', 'confidence'],
    required: [true, 'Suggestion category is required']
  },
  content: {
    type: String,
    required: [true, 'Suggestion content is required']
  }
});

export interface IFeedback extends Document {
  interviewId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  overallScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  feedbackItems: IFeedbackItem[];
  suggestions: ISuggestion[];
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Interview',
      required: [true, 'Interview ID is required']
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    overallScore: {
      type: Number,
      required: [true, 'Overall score is required'],
      min: 0,
      max: 100
    },
    summary: {
      type: String,
      required: [true, 'Feedback summary is required']
    },
    strengths: [{
      type: String,
      required: [true, 'Strengths are required']
    }],
    weaknesses: [{
      type: String,
      required: [true, 'Weaknesses are required']
    }],
    feedbackItems: [FeedbackItemSchema],
    suggestions: [SuggestionSchema]
  },
  { timestamps: true }
);

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);
