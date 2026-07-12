import Job from '../models/jobModel.js';
import Machine from '../models/machineModel.js';
import { successResponse } from '../utils/responseHandler.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Get all jobs
// @route   GET /api/v1/jobs
// @access  Private
export const getJobs = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'Farm Admin') {
      const myMachines = await Machine.find({ owner: req.user._id }).select('_id');
      const myMachineIds = myMachines.map(m => m._id);
      query = { machineId: { $in: myMachineIds } };
    }
    const jobs = await Job.find(query)
      .populate('machineId', 'name registration type')
      .populate('driverId', 'name phone');
    return successResponse(res, 200, 'Jobs retrieved successfully', jobs);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new job
// @route   POST /api/v1/jobs
// @access  Private (Admin, Farm Owner, Manager)
export const createJob = async (req, res, next) => {
  try {
    const { title, machineId, driverId, startDate, endDate, status, priority, progress, timeline } = req.body;

    if (req.user.role === 'Farm Admin' && machineId) {
      const machine = await Machine.findById(machineId);
      if (!machine || machine.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        return next(new Error('Access denied. Assigned vehicle does not belong to your account.'));
      }
    }

    const job = await Job.create({
      title,
      machineId: machineId || null,
      driverId: driverId || null,
      startDate,
      endDate: endDate || null,
      status,
      priority,
      progress: progress || 0,
      timeline: timeline || [],
    });

    await logActivity(
      req.user._id,
      req.user.name,
      'Job Assigned',
      `Deployed job: ${title}`,
      req
    );

    return successResponse(res, 201, 'Job created successfully', job);
  } catch (error) {
    next(error);
  }
};

// @desc    Update job status/progress
// @route   PUT /api/v1/jobs/:id
// @access  Private (Admin, Farm Owner, Manager, Operator)
export const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404);
      return next(new Error('Job not found'));
    }

    if (req.user.role === 'Farm Admin' && job.machineId) {
      const machine = await Machine.findById(job.machineId);
      if (!machine || machine.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        return next(new Error('Access denied. Job vehicle does not belong to your account.'));
      }
    }

    const { status, progress, timelineItem } = req.body;

    // Build update object
    const updateData = { ...req.body };
    delete updateData.timelineItem; // remove custom field before DB update

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // If an audit timeline item is pushed, append it to timeline
    if (timelineItem && timelineItem.title) {
      updatedJob.timeline.push({
        date: timelineItem.date || new Date(),
        title: timelineItem.title,
        desc: timelineItem.desc || '',
      });
      await updatedJob.save();
    }

    await logActivity(
      req.user._id,
      req.user.name,
      'Job Updated',
      `Updated job status/progress for: ${updatedJob.title}`,
      req
    );

    return successResponse(res, 200, 'Job updated successfully', updatedJob);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job
// @route   DELETE /api/v1/jobs/:id
// @access  Private (Admin, Farm Owner)
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404);
      return next(new Error('Job not found'));
    }

    if (req.user.role === 'Farm Admin' && job.machineId) {
      const machine = await Machine.findById(job.machineId);
      if (!machine || machine.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        return next(new Error('Access denied. Job vehicle does not belong to your account.'));
      }
    }

    await Job.findByIdAndDelete(req.params.id);

    await logActivity(
      req.user._id,
      req.user.name,
      'Job Deleted',
      `Deleted job registry: ${job.title}`,
      req
    );

    return successResponse(res, 200, 'Job deleted successfully');
  } catch (error) {
    next(error);
  }
};
