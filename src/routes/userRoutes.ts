import express from 'express';
import { getMe, onboardUser, updateUser } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', authMiddleware, getMe);
router.post('/onboard', authMiddleware, onboardUser);
router.put('/update', authMiddleware, updateUser);

export default router;
