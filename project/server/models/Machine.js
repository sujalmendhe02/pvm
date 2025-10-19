import mongoose from 'mongoose';

const machineSchema = new mongoose.Schema({
  machineId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'printing'],
    default: 'offline',
  },
  socketId: {
    type: String,
    default: null,
  },
  lastOnline: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Machine', machineSchema);
