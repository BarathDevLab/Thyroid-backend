import express from 'express';
import { getAdminReportHistory, getAdminSummary } from '../controllers/reportController.js';
import { authMiddleware, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/summary', authMiddleware, requireAdmin, getAdminSummary);
router.get('/reports', authMiddleware, requireAdmin, getAdminReportHistory);

export default router;