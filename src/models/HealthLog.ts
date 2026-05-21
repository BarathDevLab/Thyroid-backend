import mongoose, { Schema, Document } from 'mongoose';

export interface IHealthLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  weight?: number;
  systolicBP?: number;
  diastolicBP?: number;
  sugarLevel?: number;
  waterIntake?: number; // glasses
  mood?: string;
  notes?: string;
}

const HealthLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  weight: { type: Number },
  systolicBP: { type: Number },
  diastolicBP: { type: Number },
  sugarLevel: { type: Number },
  waterIntake: { type: Number, default: 0 },
  mood: { type: String },
  notes: { type: String },
}, { timestamps: true });

// Ensure one log per user per day (simple version)
HealthLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model<IHealthLog>('HealthLog', HealthLogSchema);
