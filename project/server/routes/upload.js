import express from 'express';
import { upload } from '../middleware/upload.js';
import { uploadPDF } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/pdf', upload.single('pdf'), uploadPDF);

export default router;
