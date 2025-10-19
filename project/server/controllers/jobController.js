import PrintJob from '../models/PrintJob.js';
import Machine from '../models/Machine.js';

const COST_PER_PAGE = 2;
const PRIORITY_MULTIPLIER = {
  1: 1.5,
  2: 1,
};

export const createJob = async (req, res) => {
  try {
    const {
      machineId,
      userName,
      fileUrl,
      fileName,
      cloudinaryPublicId,
      pageCount,
      pagesToPrint,
      priority = 2,
    } = req.body;

    if (!machineId || !userName || !fileUrl || !fileName || !cloudinaryPublicId || !pageCount || !pagesToPrint) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const machine = await Machine.findOne({ machineId });
    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    if (machine.status !== 'online') {
      return res.status(400).json({ error: 'Machine is offline' });
    }

    const cost = pagesToPrint.length * COST_PER_PAGE * PRIORITY_MULTIPLIER[priority];

    const job = await PrintJob.create({
      machineId,
      userName,
      fileUrl,
      fileName,
      cloudinaryPublicId,
      pageCount,
      pagesToPrint,
      priority,
      cost,
      status: 'queued',
    });

    res.json({
      job: {
        id: job._id,
        machineId: job.machineId,
        userName: job.userName,
        fileName: job.fileName,
        pageCount: job.pageCount,
        pagesToPrint: job.pagesToPrint,
        priority: job.priority,
        status: job.status,
        cost: job.cost,
        createdAt: job.createdAt,
      },
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
};

export const getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await PrintJob.findById(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      job: {
        id: job._id,
        machineId: job.machineId,
        userName: job.userName,
        fileName: job.fileName,
        pageCount: job.pageCount,
        pagesToPrint: job.pagesToPrint,
        priority: job.priority,
        status: job.status,
        cost: job.cost,
        error: job.error,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get job status error:', error);
    res.status(500).json({ error: 'Failed to get job status' });
  }
};

export const getMachineQueue = async (req, res) => {
  try {
    const { machineId } = req.params;

    const jobs = await PrintJob.find({
      machineId,
      status: { $in: ['queued', 'printing'] },
    }).sort({ priority: 1, createdAt: 1 });

    res.json({
      queue: jobs.map(job => ({
        id: job._id,
        userName: job.userName,
        fileName: job.fileName,
        status: job.status,
        priority: job.priority,
        createdAt: job.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get machine queue error:', error);
    res.status(500).json({ error: 'Failed to get machine queue' });
  }
};

export const updateJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, error } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const job = await PrintJob.findById(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    job.status = status;
    if (error) {
      job.error = error;
    }

    await job.save();

    res.json({
      job: {
        id: job._id,
        status: job.status,
        error: job.error,
      },
    });
  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({ error: 'Failed to update job status' });
  }
};
