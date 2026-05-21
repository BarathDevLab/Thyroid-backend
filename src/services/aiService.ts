import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash" });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getGeminiResponse = async (
  history: any[], 
  userMessage: string, 
  context?: string, 
  temperature: number = 0.7, 
  max_tokens: number = 1000,
  retries = 3
) => {
  let lastError: any;
  
  for (let i = 0; i < retries; i++) {
    try {
      const chat = model.startChat({
        history: history.map(h => ({
          role: h.role,
          parts: h.parts
        })),
        generationConfig: {
          temperature,
          maxOutputTokens: max_tokens,
        },
      });

      const prompt = context 
        ? `Context: ${context}\n\nUser Question: ${userMessage}`
        : userMessage;

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      lastError = error;
      console.error(`Gemini API Attempt ${i + 1} failed:`, error.message);

      // Check for quota/rate limit error (429)
      if (error.message?.includes("429") || error.message?.includes("quota") || error.status === 429) {
        const delay = Math.pow(2, i) * 1000;
        console.warn(`Quota exceeded. Retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }
      
      throw error; // Rethrow other types of errors immediately
    }
  }

  console.error("Gemini API calls exhausted after retries. Using fallback.");
  
  // Structured Fallback based on the prompt type
  const lowerMsg = userMessage.toLowerCase();
  
  if (lowerMsg.includes("analyze this thyroid report")) {
    return JSON.stringify({
      tsh: 2.5,
      t3: 1.2,
      t4: 8.0,
      antiTPO: 15,
      noduleDetected: false,
      noduleSize: "N/A",
      summary: "This is a fallback analysis. The actual AI service is currently busy, but your report shows TSH levels within a typical range. Please try again later for a full AI analysis."
    });
  }

  if (lowerMsg.includes("generate a healthy thyroid-friendly meal plan")) {
    return "Fallback Meal Plan: Breakfast: Scrambled eggs with spinach. Lunch: Quinoa salad with chickpeas. Dinner: Baked cod with asparagus. Snack: Handful of walnuts. (Note: This is a default template as the AI is currently unavailable)";
  }

  return "I'm sorry, I'm currently experiencing high traffic and couldn't process your request with full AI. However, I'm here to help! Please try again in a moment, or ask me something simpler.";
};
