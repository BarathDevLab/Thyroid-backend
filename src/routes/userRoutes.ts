import express from 'express';
import { getMe, onboardUser, updateUser } from '../controllers/userController.js';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', optionalAuth, getMe);
router.post('/onboard', authMiddleware, onboardUser);
router.put('/update', authMiddleware, updateUser);

export default router;
