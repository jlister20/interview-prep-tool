import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'cv' | 'jobSpec';
  title: string;
  content: string;
  fileUrl?: string;
  fileType?: string;
  status: 'pending' | 'processed' | 'error';
  processingError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    type: {
      type: String,
      enum: ['cv', 'jobSpec'],
      required: [true, 'Document type is required']
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    content: {
      type: String,
      required: [true, 'Document content is required']
    },
    fileUrl: {
      type: String
    },
    fileType: {
      type: String
    },
    status: {
      type: String,
      enum: ['pending', 'processed', 'error'],
      default: 'pending'
    },
    processingError: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model<IDocument>('Document', DocumentSchema);
