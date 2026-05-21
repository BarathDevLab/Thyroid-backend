import express from 'express';
import { analyzeReport, getReportHistory } from '../controllers/reportController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/history', authMiddleware, getReportHistory);
router.post('/analyze', authMiddleware, analyzeReport);

export default router;
