import { Request, Response } from 'express';
import Report from '../models/Report.js';
import User from '../models/User.js';
import { getGeminiResponse } from '../services/aiService.js';

export const analyzeReport = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { fileName, fileUrl, rawText } = req.body;

    // Simulate Gemini Analysis (in real case, we'd send the image/PDF or text to Gemini)
    const prompt = `Analyze this thyroid report and provide a JSON object with: tsh, t3, t4, antiTPO, noduleDetected (boolean), noduleSize, and summary. 
    Report Text: ${rawText}`;

    // For mock, we'll just extract some hardcoded-ish values or simple regex
    const aiResponse = await getGeminiResponse([], prompt);
    
    let reportData;
    try {
      // Try to parse JSON from AI (real or fallback)
      const parsed = JSON.parse(aiResponse);
      reportData = {
        tsh: parsed.tsh || 0,
        t3: parsed.t3 || 0,
        t4: parsed.t4 || 0,
        antiTPO: parsed.antiTPO || 0,
        noduleDetected: !!parsed.noduleDetected,
        noduleSize: parsed.noduleSize || "N/A",
        summary: parsed.summary || "No summary available."
      };
    } catch (e) {
      // Fallback if parsing fails (unlikely with our new service logic)
      reportData = {
        tsh: 0,
        t3: 0,
        t4: 0,
        noduleDetected: false,
        summary: aiResponse.substring(0, 500)
      };
    }

    const newReport = await Report.create({
      userId: user._id,
      fileName,
      fileUrl,
      data: reportData,
      originalText: rawText
    });

    res.status(201).json(newReport);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getReportHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const reports = await Report.find({ userId: user._id }).sort({ analyzedDate: -1 });
    res.status(200).json(reports);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
