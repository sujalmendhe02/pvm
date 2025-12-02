import express from 'express';
import { upload } from '../middleware/upload.js';
import { uploadPDF } from '../controllers/uploadController.js';

const router = express.Router();

console.log("uploadRoutes file loaded ✔️");


router.post('/', upload.single('pdf'), uploadPDF);

console.log("Available upload routes:", router.stack.map(r => r.route?.path));


export default router;
