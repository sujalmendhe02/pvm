import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  linkedMachine: {
    type: String,
    ref: 'Machine',
    default: null,
  },
  socketId: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

export default mongoose.model('User', userSchema);
