import express from 'express';
import {
  registerMachine,
  connectToMachine,
  getMachineStatus,
} from '../controllers/machineController.js';

const router = express.Router();

router.post('/register', registerMachine);
router.post('/connect', connectToMachine);
router.get('/status/:machineId', getMachineStatus);

export default router;
