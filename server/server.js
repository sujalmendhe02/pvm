import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import cloudinary from './config/cloudinary.js';
import { connectDatabase } from './config/database.js';
import { setupSocketIO } from './socket/index.js';
import machineRoutes from './routes/machine.js';
import jobRoutes from './routes/job.js';
import uploadRoutes from './routes/upload.js';
import paymentRoutes from './routes/payment.js';

dotenv.config();

const app = express();
const server = createServer(app);

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/machine', machineRoutes);
app.use('/api/job', jobRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

setupSocketIO(server);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDatabase();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

(async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log("✅ Cloudinary connection successful:", result);
  } catch (error) {
    console.error("❌ Cloudinary connection failed:", error.message);
  }
})();

startServer();
