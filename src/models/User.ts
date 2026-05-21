import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  age: number;
  gender: string;
  bloodType: string;
  healthGoals: {
    tshGoal: number;
    weightGoal: number;
  };
  role: 'user' | 'admin' | 'doctor';
  onboarded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  age: { type: Number },
  gender: { type: String },
  bloodType: { type: String },
  healthGoals: {
    tshGoal: { type: Number, default: 2.2 },
    weightGoal: { type: Number },
  },
  role: { type: String, enum: ['user', 'admin', 'doctor'], default: 'user' },
  onboarded: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
