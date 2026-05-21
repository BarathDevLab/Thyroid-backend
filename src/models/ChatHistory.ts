import mongoose, { Schema, Document } from 'mongoose';

export interface IChatHistory extends Document {
  userId: mongoose.Types.ObjectId;
  role: 'user' | 'model'; // matching Gemini role naming
  parts: { text: string }[];
  timestamp: Date;
}

const ChatHistorySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['user', 'model'], required: true },
  parts: [{
    text: { type: String, required: true }
  }],
}, { timestamps: true });

export default mongoose.model<IChatHistory>('ChatHistory', ChatHistorySchema);
