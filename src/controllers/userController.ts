import { Request, Response } from 'express';
import User from '../models/User.js';

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      // Create a default user if not found (for mock purposes)
      // Note: If userId is the MongoDB _id, it's usually auto-generated.
      // If userId is an external ID, it should be stored as a field.
      // Assuming userId is the MongoDB _id, we cannot create a user with a specific _id here
      // unless it's a custom ID. For simplicity, we'll create a new user without specifying _id.
      // If the intent was to store the external userId as a field, the schema needs adjustment.
      // For now, we'll create a new user and return it.
      const newUser = await User.create({
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'user'
      });
    }
    
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const onboardUser = async (req: Request, res: Response) => {
  try {
    const firebaseId = (req as any).user.firebaseId;
    const { name, age, gender, bloodType, healthGoals } = req.body;
    
    const user = await User.findOneAndUpdate(
      { firebaseId },
      { name, age, gender, bloodType, healthGoals, onboarded: true },
      { new: true, upsert: true }
    );
    
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const firebaseId = (req as any).user.firebaseId;
    const updates = req.body;
    
    const user = await User.findOneAndUpdate(
      { firebaseId },
      updates,
      { new: true }
    );
    
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
