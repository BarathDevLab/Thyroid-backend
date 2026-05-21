import mongoose, { Schema, Document } from 'mongoose';

export interface IMealPlan extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  meals: {
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    name: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    consumed: boolean;
  }[];
  totalCalories: number;
}

const MealPlanSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  meals: [{
    type: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
    name: { type: String, required: true },
    description: { type: String },
    calories: { type: Number },
    protein: { type: Number },
    carbs: { type: Number },
    fats: { type: Number },
    consumed: { type: Boolean, default: false },
  }],
  totalCalories: { type: Number },
}, { timestamps: true });

export default mongoose.model<IMealPlan>('MealPlan', MealPlanSchema);
