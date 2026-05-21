import express from 'express';
import { getHealthLogs, addHealthLog, getTodaySummary } from '../controllers/healthController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/logs', authMiddleware, getHealthLogs);
router.post('/log', authMiddleware, addHealthLog);
router.get('/summary', authMiddleware, getTodaySummary);

export default router;
