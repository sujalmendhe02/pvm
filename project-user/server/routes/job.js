import express from 'express';
import {
  createJob,
  getJobStatus,
  getMachineQueue,
  updateJobStatus,
} from '../controllers/jobController.js';

const router = express.Router();

router.post('/', createJob);
router.post('/create', createJob);
router.get('/status/:jobId', getJobStatus);
router.get('/queue/:machineId', getMachineQueue);
router.put('/update/:jobId', updateJobStatus);

export default router;
