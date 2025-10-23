import mongoose from 'mongoose';

const printJobSchema = new mongoose.Schema({
  machineId: {
    type: String,
    required: true,
    ref: 'Machine',
  },
  userName: {
    type: String,
    required: true,
  },
  userSocketId: {
    type: String,
    default: null,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  cloudinaryPublicId: {
    type: String,
    required: true,
  },
  pageCount: {
    type: Number,
    required: true,
  },
  pagesToPrint: {
    type: [Number],
    required: true,
  },
  priority: {
    type: Number,
    enum: [1, 2],
    default: 2,
  },
  status: {
    type: String,
    enum: ['queued', 'printing', 'completed', 'failed'],
    default: 'queued',
  },
  cost: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending',
  },
  paymentId: {
    type: String,
    default: null,
  },
  razorpayOrderId: {
    type: String,
    default: null,
  },
  paymentDate: {
    type: Date,
    default: null,
  },
  error: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

printJobSchema.index({ machineId: 1, status: 1, priority: 1, createdAt: 1 });

export default mongoose.model('PrintJob', printJobSchema);
