import { Request, Response } from 'express';
import User from '../models/User.js';

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    let user = null;

    if (userId) {
      user = await User.findById(userId);
    }

    if (!user) {
      user = await User.findOne({ email: 'demo@local' });
    }

    if (!user) {
      user = await User.create({
        name: 'Local User',
        email: 'demo@local',
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
