import express from 'express';
import { sendMessage, getChatHistory } from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/history', authMiddleware, getChatHistory);
router.post('/message', authMiddleware, sendMessage);

export default router;
