import { Request, Response } from 'express';
import User from '../models/User.js';
import ChatHistory from '../models/ChatHistory.js';
import Report from '../models/Report.js';
import { getGeminiResponse } from '../services/aiService.js';

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { message, temperature, max_tokens } = req.body;

    // 1. Fetch History
    const historyDocs = await ChatHistory.find({ userId: user._id }).sort({ createdAt: 1 }).limit(10);
    const history = historyDocs.map(doc => ({
      role: doc.role,
      parts: doc.parts
    }));

    // 2. Retrieval (RAG) - Search Reports for context
    const recentReports = await Report.find({ userId: user._id }).sort({ analyzedDate: -1 }).limit(3);
    let context = "";
    if (recentReports.length > 0) {
      context = "Relevant data from recent reports:\n" + 
        recentReports.map(r => `Document: ${r.fileName}, TSH: ${r.data.tsh}, Summary: ${r.data.summary}`).join("\n");
    }

    // 3. Get Gemini Response
    let aiResponseText;
    try {
      aiResponseText = await getGeminiResponse(history, message, context, temperature, max_tokens);
    } catch (error: any) {
      console.error("Chat AI Error:", error.message, error.stack);
      aiResponseText = "I'm sorry, I'm having trouble connecting to my AI brain right now. Please try again in a moment.";
    }

    // 4. Save History
    await ChatHistory.create({
      userId: user._id,
      role: 'user',
      parts: [{ text: message }]
    });

    await ChatHistory.create({
      userId: user._id,
      role: 'model',
      parts: [{ text: aiResponseText }]
    });

    res.status(200).json({ response: aiResponseText });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const history = await ChatHistory.find({ userId: user._id }).sort({ createdAt: 1 });
    res.status(200).json(history);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
