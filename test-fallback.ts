
import { getGeminiResponse } from './src/services/aiService.js';
import dotenv from 'dotenv';

dotenv.config();

async function testFallback() {
  console.log("--- Testing Report Analysis Fallback ---");
  const reportPrompt = "Analyze this thyroid report: TSH 2.5";
  const reportFallback = await getGeminiResponse([], reportPrompt);
  console.log("Report Fallback:", reportFallback);
  try {
    const parsed = JSON.parse(reportFallback);
    console.log("Parsed Report Data:", parsed);
  } catch (e) {
    console.error("Failed to parse report fallback as JSON");
  }

  console.log("\n--- Testing Meal Plan Fallback ---");
  const mealPrompt = "Generate a healthy thyroid-friendly meal plan for Sarah Mitchell";
  const mealFallback = await getGeminiResponse([], mealPrompt);
  console.log("Meal Fallback:", mealFallback);

  console.log("\n--- Testing General Chat Fallback ---");
  const chatPrompt = "Hello, how are you?";
  const chatFallback = await getGeminiResponse([], chatPrompt);
  console.log("Chat Fallback:", chatFallback);
}

// To simulate 429 error, we would temporarily modify aiService.ts 
// OR just trust the deterministic fallback logic for now if we can't easily mock the API response.
// Let's run it and see if it hits actual API or if we can force a fallback.

testFallback().catch(console.error);
