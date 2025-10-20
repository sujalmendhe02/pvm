import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  updatePaymentStatus,
} from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-order/:jobId', createPaymentOrder);
router.post('/verify/:jobId', verifyPayment);
router.patch('/status/:jobId', updatePaymentStatus);

export default router;
