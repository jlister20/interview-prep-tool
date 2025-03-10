import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion extends Document {
  text: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source: 'cv' | 'jobSpec' | 'general';
}

const QuestionSchema = new Schema<IQuestion>({
  text: {
    type: String,
    required: [true, 'Question text is required']
  },
  category: {
    type: String,
    required: [true, 'Question category is required']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  source: {
    type: String,
    enum: ['cv', 'jobSpec', 'general'],
    default: 'general'
  }
});

export interface IResponse extends Document {
  questionId: mongoose.Types.ObjectId;
  audioUrl?: string;
  transcription?: string;
  duration?: number;
}

const ResponseSchema = new Schema<IResponse>({
  questionId: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: [true, 'Question ID is required']
  },
  audioUrl: {
    type: String
  },
  transcription: {
    type: String
  },
  duration: {
    type: Number
  }
});

export interface IInterview extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  questions: IQuestion[];
  responses: IResponse[];
  status: 'in-progress' | 'completed';
  startTime: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema = new Schema<IInterview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    title: {
      type: String,
      required: [true, 'Interview title is required'],
      trim: true
    },
    questions: [QuestionSchema],
    responses: [ResponseSchema],
    status: {
      type: String,
      enum: ['in-progress', 'completed'],
      default: 'in-progress'
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: {
      type: Date
    }
  },
  { timestamps: true }
);

export default mongoose.model<IInterview>('Interview', InterviewSchema);
