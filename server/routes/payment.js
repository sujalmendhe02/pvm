import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  updatePaymentStatus,
} from '../controllers/paymentController.js';

const router = express.Router();

console.log("paymentRoutes file loaded ✔️");


router.post('/create-order/:jobId', createPaymentOrder);
router.post('/verify/:jobId', verifyPayment);
router.patch('/status/:jobId', updatePaymentStatus);

console.log("Available payment routes:", router.stack.map(r => r.route?.path));

export default router;
