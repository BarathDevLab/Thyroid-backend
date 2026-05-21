import express from 'express';
import { analyzeReport, createReport, getReportHistory, getReportSummary } from '../controllers/reportController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/summary', optionalAuth, getReportSummary);
router.get('/history', optionalAuth, getReportHistory);
router.get('/', optionalAuth, getReportHistory);
router.post('/analyze', optionalAuth, analyzeReport);
router.post('/', optionalAuth, createReport);

export default router;
