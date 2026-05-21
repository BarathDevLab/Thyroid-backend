import { Request, Response } from 'express';
import HealthLog from '../models/HealthLog.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

export const getHealthLogs = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const logs = await HealthLog.find({ userId: user._id }).sort({ date: -1 }).limit(30);
    res.status(200).json(logs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addHealthLog = async (req: Request, res: Response) => {
  try {
    const firebaseId = (req as any).user.firebaseId;
    const user = await User.findOne({ firebaseId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { date, weight, systolicBP, diastolicBP, sugarLevel, waterIntake, mood, notes } = req.body;
    
    // UPSERT log for the specific date
    const logDate = date ? new Date(date) : new Date();
    logDate.setHours(0, 0, 0, 0); // Normalize to start of day

    const log = await HealthLog.findOneAndUpdate(
      { userId: user._id, date: logDate },
      { weight, systolicBP, diastolicBP, sugarLevel, waterIntake, mood, notes },
      { new: true, upsert: true }
    );

    res.status(201).json(log);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTodaySummary = async (req: Request, res: Response) => {
  try {
    const firebaseId = (req as any).user.firebaseId;
    const user = await User.findOne({ firebaseId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const log = await HealthLog.findOne({ userId: user._id, date: today });
    res.status(200).json(log || { message: 'No logs for today yet', waterIntake: 0 });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
