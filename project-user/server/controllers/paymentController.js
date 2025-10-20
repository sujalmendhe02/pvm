import Razorpay from 'razorpay';
import crypto from 'crypto';
import PrintJob from '../models/PrintJob.js';

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_VTeHEBn3aNjFQV',
  key_secret: process.env.RAZORPAY_KEY_SECRET  || 'XgWhkUAIqIkH6btlq6UTb7ak',
});

export const createPaymentOrder = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await PrintJob.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.payment_status === 'paid') {
      return res.status(400).json({ error: 'Job already paid' });
    }

    const amountInPaise = Math.round(job.cost * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `job_${job._id}`,
      notes: {
        jobId: job._id.toString(),
        machineId: job.machineId,
        userName: job.userName,
      },
    };

    const order = await razorpayInstance.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      jobId: job._id,
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    const job = await PrintJob.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    job.payment_status = 'paid';
    job.payment_id = razorpay_payment_id;
    job.razorpay_order_id = razorpay_order_id;
    job.payment_date = new Date();

    await job.save();

    res.json({
      success: true,
      job: {
        id: job._id,
        payment_status: job.payment_status,
        payment_id: job.payment_id,
        status: job.status,
      },
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { payment_status, payment_id } = req.body;

    const job = await PrintJob.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    job.payment_status = payment_status;
    if (payment_id) {
      job.payment_id = payment_id;
      job.payment_date = new Date();
    }

    await job.save();

    res.json(job);
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
};
