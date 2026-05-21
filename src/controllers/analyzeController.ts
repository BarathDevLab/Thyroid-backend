import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || '');

type MulterRequest = Request & { file?: Express.Multer.File };

export const analyzeImage = async (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    if (!process.env.GOOGLE_AI_KEY) {
      return res.status(500).json({ error: 'GOOGLE_AI_KEY not configured' });
    }

    const modelName = process.env.MEDGEMMA_MODEL || 'gemini-3.5-flash';
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { temperature: 0.1 }
    });

    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype
      }
    };

    const prompt = `You are a medical assistant specializing in thyroid health.
Analyze this image for visible signs related to thyroid conditions such as:
- Neck swelling or goiter
- Skin texture or pigmentation changes
- Facial puffiness or eyebrow thinning (hypothyroidism)
- Eye protrusion or lid retraction (hyperthyroidism)

Respond ONLY in this JSON format, no extra text:
{
  "observations": ["observation 1", "observation 2"],
  "risk_level": "low | moderate | high",
  "recommendation": "brief recommendation string",
  "disclaimer": "This is not a medical diagnosis. Consult a licensed physician."
}`;

    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    res.json(parsed);
  } catch (err: any) {
    console.error('MedGemma error:', err.message);
    res.status(500).json({ error: 'Analysis failed. Try again.' });
  }
};
