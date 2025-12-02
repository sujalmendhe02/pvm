import express from 'express';
import {
  registerMachine,
  connectToMachine,
  getMachineStatus,
} from '../controllers/machineController.js';

const router = express.Router();

console.log("machineRoutes file loaded ✔️");


router.post('/register', registerMachine);
router.post('/connect', connectToMachine);
router.get('/status/:machineId', getMachineStatus);

console.log("Available machine routes:", router.stack.map(r => r.route?.path));


export default router;
