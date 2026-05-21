import express from 'express';
import multer from 'multer';
import { analyzeImage } from '../controllers/analyzeController.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/', upload.single('image'), analyzeImage);

export default router;
