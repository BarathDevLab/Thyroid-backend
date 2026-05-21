import express from 'express';
import { getTodayMeals, consumeMeal } from '../controllers/mealController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/today', authMiddleware, getTodayMeals);
router.patch('/:mealId/consume', authMiddleware, consumeMeal);

export default router;
