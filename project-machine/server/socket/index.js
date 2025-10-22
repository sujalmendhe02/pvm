import { Server } from 'socket.io';
import Machine from '../models/Machine.js';
import PrintJob from '../models/PrintJob.js';

export const setupSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('machine:register', async (data) => {
      try {
        const { machineId } = data;
        const machine = await Machine.findOne({ machineId });

        if (machine) {
          machine.socketId = socket.id;
          machine.status = 'online';
          machine.lastOnline = new Date();
          await machine.save();

          socket.join(`machine-${machineId}`);
          socket.emit('machine:registered', { success: true, machineId });
          console.log(`Machine ${machineId} registered with socket ${socket.id}`);
        }
      } catch (error) {
        console.error('Machine register error:', error);
        socket.emit('error', { message: 'Failed to register machine' });
      }
    });

    socket.on('user:join', async (data) => {
      try {
        const { machineId, userName } = data;
        socket.join(`machine-${machineId}`);
        socket.emit('user:joined', { success: true, machineId, userName });
        console.log(`User ${userName} joined machine ${machineId}`);
      } catch (error) {
        console.error('User join error:', error);
        socket.emit('error', { message: 'Failed to join machine' });
      }
    });

    socket.on('job:created', async (data) => {
      try {
        const { jobId, machineId } = data;
        const job = await PrintJob.findById(jobId);

        if (job) {
          io.to(`machine-${machineId}`).emit('job:queued', {
            job: {
              id: job._id,
              userName: job.userName,
              fileName: job.fileName,
              status: job.status,
              priority: job.priority,
            },
          });
        }
      } catch (error) {
        console.error('Job created event error:', error);
      }
    });

    socket.on('job:start', async (data) => {
      try {
        const { jobId, machineId } = data;
        const job = await PrintJob.findById(jobId);

        if (job) {
          job.status = 'printing';
          await job.save();

          const machine = await Machine.findOne({ machineId });
          if (machine) {
            machine.status = 'printing';
            await machine.save();
          }

          io.to(`machine-${machineId}`).emit('job:printing', {
            job: {
              id: job._id,
              userName: job.userName,
              fileName: job.fileName,
              status: job.status,
            },
          });
        }
      } catch (error) {
        console.error('Job start error:', error);
      }
    });

    socket.on('job:complete', async (data) => {
      try {
        const { jobId, machineId } = data;
        const job = await PrintJob.findById(jobId);

        if (job) {
          job.status = 'completed';
          await job.save();

          const machine = await Machine.findOne({ machineId });
          if (machine) {
            machine.status = 'online';
            await machine.save();
          }

          io.to(`machine-${machineId}`).emit('job:completed', {
            job: {
              id: job._id,
              userName: job.userName,
              fileName: job.fileName,
              status: job.status,
            },
          });
        }
      } catch (error) {
        console.error('Job complete error:', error);
      }
    });

    socket.on('job:failed', async (data) => {
      try {
        const { jobId, machineId, error } = data;
        const job = await PrintJob.findById(jobId);

        if (job) {
          job.status = 'failed';
          job.error = error;
          await job.save();

          const machine = await Machine.findOne({ machineId });
          if (machine) {
            machine.status = 'online';
            await machine.save();
          }

          io.to(`machine-${machineId}`).emit('job:failed', {
            job: {
              id: job._id,
              userName: job.userName,
              fileName: job.fileName,
              status: job.status,
              error: job.error,
            },
          });
        }
      } catch (error) {
        console.error('Job failed error:', error);
      }
    });

    socket.on('disconnect', async () => {
      try {
        const machine = await Machine.findOne({ socketId: socket.id });
        if (machine) {
          machine.status = 'offline';
          machine.socketId = null;
          await machine.save();
          console.log(`Machine ${machine.machineId} disconnected`);
        }
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });
  });

  return io;
};
