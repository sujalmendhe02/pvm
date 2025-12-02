import express from 'express';
import {
  createJob,
  getJobStatus,
  getMachineQueue,
  updateJobStatus,
} from '../controllers/jobController.js';

const router = express.Router();

console.log("jobRoutes file loaded ✔️");


//router.post('/', createJob);
router.post('/create', createJob);
router.get('/status/:jobId', getJobStatus);
router.get('/queue/:machineId', getMachineQueue);
router.put('/update/:jobId', updateJobStatus);

console.log("Available job routes:", router.stack.map(r => r.route?.path));


export default router;
