import { Request, Response } from 'express';
import MealPlan from '../models/MealPlan.js';
import User from '../models/User.js';
import { getGeminiResponse } from '../services/aiService.js';

export const getTodayMeals = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let plan = await MealPlan.findOne({ userId: user._id, date: today });
    
    if (!plan) {
      // Trigger AI Generation if no plan for today
      const prompt = `Generate a healthy thyroid-friendly meal plan for Sarah Mitchell. 
      Age: ${user.age}, TSH Goal: ${user.healthGoals.tshGoal}.
      Provide Breakfast, Lunch, Dinner, and a Snack with calories and macros.`;
      
      let aiResponse;
      try {
        aiResponse = await getGeminiResponse([], prompt);
      } catch (error) {
        console.error("Meal Generation AI Error:", error);
        // We'll proceed with the default values below since aiService provides a string fallback anyway
        aiResponse = "Fallback used";
      }
      
      // Mock parsing (or use aiResponse if it was structured)
      plan = await MealPlan.create({
        userId: user._id,
        date: today,
        meals: [
          { type: 'breakfast', name: 'Oatmeal with Blueberries', calories: 350, protein: 10, carbs: 50, fats: 10, consumed: false },
          { type: 'lunch', name: 'Grilled Salmon Salad', calories: 500, protein: 35, carbs: 15, fats: 25, consumed: false },
          { type: 'dinner', name: 'Quinoa and Roasted Veggies', calories: 450, protein: 15, carbs: 60, fats: 15, consumed: false },
          { type: 'snack', name: 'Greek Yogurt', calories: 150, protein: 12, carbs: 10, fats: 5, consumed: false }
        ],
        totalCalories: 1450
      });
    }

    res.status(200).json(plan);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const consumeMeal = async (req: Request, res: Response) => {
  try {
    const { mealId } = req.params;
    const plan = await MealPlan.findOneAndUpdate(
      { "meals._id": mealId },
      { $set: { "meals.$.consumed": true } },
      { new: true }
    );
    res.status(200).json(plan);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
