import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  userId: mongoose.Types.ObjectId;
  fileName: string;
  fileUrl: string;
  analyzedDate: Date;
  data: {
    tsh?: number;
    t3?: number;
    t4?: number;
    antiTPO?: number;
    noduleDetected?: boolean;
    noduleSize?: string;
    summary?: string;
  };
  originalText?: string;
}

const ReportSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  analyzedDate: { type: Date, default: Date.now },
  data: {
    tsh: { type: Number },
    t3: { type: Number },
    t4: { type: Number },
    antiTPO: { type: Number },
    noduleDetected: { type: Boolean },
    noduleSize: { type: String },
    summary: { type: String },
  },
  originalText: { type: String },
}, { timestamps: true });

export default mongoose.model<IReport>('Report', ReportSchema);
