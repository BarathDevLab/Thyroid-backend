
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
async function list() {
  try {
    const models = await genAI.listModels();
    console.log("MODELS:", models.models.map(m => m.name).join(", "));
  } catch (e: any) {
    console.log("ERROR:", e.message);
  }
}
list();
