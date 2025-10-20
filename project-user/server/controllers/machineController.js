import Machine from '../models/Machine.js';
import QRCode from 'qrcode';

export const registerMachine = async (req, res) => {
  try {
    const { machineId, name, location } = req.body;

    if (!machineId || !name || !location) {
      return res.status(400).json({ error: 'Machine ID, name, and location are required' });
    }

    let machine = await Machine.findOne({ machineId });

    if (machine) {
      machine.name = name;
      machine.location = location;
      machine.status = 'online';
      machine.lastOnline = new Date();
      await machine.save();
    } else {
      machine = await Machine.create({
        machineId,
        name,
        location,
        status: 'online',
      });
    }

    const qrData = `${process.env.CLIENT_URL}/connect?machineId=${machineId}`;
    const qrCode = await QRCode.toDataURL(qrData);

    res.json({
      machine,
      qrCode,
    });
  } catch (error) {
    console.error('Register machine error:', error);
    res.status(500).json({ error: 'Failed to register machine' });
  }
};

export const connectToMachine = async (req, res) => {
  try {
    const { machineId, machineKey, userName } = req.body;
    const key = machineKey || machineId;

    if (!key || !userName) {
      return res.status(400).json({ error: 'Machine ID and user name are required' });
    }

    const machine = await Machine.findOne({ machineId: key });

    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    if (machine.status !== 'online') {
      return res.status(400).json({ error: 'Machine is offline' });
    }

    res.json({
      success: true,
      machine: {
        _id: machine._id,
        id: machine._id,
        machineId: machine.machineId,
        name: machine.name,
        location: machine.location,
        status: machine.status,
        rate_per_page: machine.ratePerPage || 2,
      },
      user: {
        _id: key + '_' + Date.now(),
        id: key + '_' + Date.now(),
        name: userName,
      },
      session: {
        id: Date.now().toString(),
      },
    });
  } catch (error) {
    console.error('Connect machine error:', error);
    res.status(500).json({ error: 'Failed to connect to machine' });
  }
};

export const getMachineStatus = async (req, res) => {
  try {
    const { machineId } = req.params;

    const machine = await Machine.findOne({ machineId });

    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    res.json({
      machine: {
        machineId: machine.machineId,
        name: machine.name,
        location: machine.location,
        status: machine.status,
      },
    });
  } catch (error) {
    console.error('Get machine status error:', error);
    res.status(500).json({ error: 'Failed to get machine status' });
  }
};
