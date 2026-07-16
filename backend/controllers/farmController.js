import Farm from '../models/farmModel.js';
import Machine from '../models/machineModel.js';
import GPSDevice from '../models/gpsDeviceModel.js';
import { successResponse } from '../utils/responseHandler.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Get all farms (filtered by ownership for Farm Admins)
// @route   GET /api/v1/farms
// @access  Private
export const getFarms = async (req, res, next) => {
  try {
    const query = req.user.role === 'Farm Admin' ? { owner: req.user._id } : {};
    const farms = await Farm.find(query).populate('owner', 'name phone email company');
    return successResponse(res, 200, 'Farms retrieved successfully', farms);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single farm details
// @route   GET /api/v1/farms/:id
// @access  Private
export const getFarmById = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.id).populate('owner', 'name phone email company');
    if (!farm) {
      res.status(404);
      return next(new Error('Farm not found'));
    }

    if (req.user.role === 'Farm Admin' && farm.owner._id.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Access denied. This farm does not belong to your account.'));
    }

    return successResponse(res, 200, 'Farm details retrieved successfully', farm);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new farm
// @route   POST /api/v1/farms
// @access  Private (Admin or Farm Admin)
export const createFarm = async (req, res, next) => {
  const { name, ownerId } = req.body;

  if (!name || !name.trim()) {
    res.status(400);
    return next(new Error('Farm name is required'));
  }

  try {
    const owner = req.user.role === 'Farm Admin' ? req.user._id : ownerId;
    if (!owner) {
      res.status(400);
      return next(new Error('Owner reference is required for farm creation.'));
    }

    const farm = await Farm.create({
      name,
      owner,
    });

    await logActivity(
      req.user._id,
      req.user.name,
      'Settings Update',
      `Registered new farm block: "${name}"`,
      req
    );

    return successResponse(res, 201, 'Farm created successfully', farm);
  } catch (error) {
    next(error);
  }
};

// @desc    Update farm details
// @route   PUT /api/v1/farms/:id
// @access  Private
export const updateFarm = async (req, res, next) => {
  const { name } = req.body;

  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      res.status(404);
      return next(new Error('Farm not found'));
    }

    if (req.user.role === 'Farm Admin' && farm.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Access denied. This farm does not belong to your account.'));
    }

    farm.name = name || farm.name;
    await farm.save();

    await logActivity(
      req.user._id,
      req.user.name,
      'Settings Update',
      `Updated farm details for: "${farm.name}"`,
      req
    );

    return successResponse(res, 200, 'Farm updated successfully', farm);
  } catch (error) {
    next(error);
  }
};

// @desc    Soft Delete a Farm (cascades soft-delete to associated vehicles)
// @route   DELETE /api/v1/farms/:id
// @access  Private
export const deleteFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      res.status(404);
      return next(new Error('Farm not found'));
    }

    if (req.user.role === 'Farm Admin' && farm.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Access denied. This farm does not belong to your account.'));
    }

    const timestamp = new Date();

    // Soft delete the farm
    farm.isDeleted = true;
    farm.deletedAt = timestamp;
    farm.deletedBy = req.user._id;
    await farm.save();

    // Cascade Soft Delete to Vehicles under this Farm
    await Machine.updateMany(
      { farmId: farm._id },
      { $set: { isDeleted: true, deletedAt: timestamp, deletedBy: req.user._id } }
    );

    await logActivity(
      req.user._id,
      req.user.name,
      'Settings Update',
      `Soft deleted farm: "${farm.name}" and archived associated assets.`,
      req
    );

    return successResponse(res, 200, 'Farm soft deleted successfully');
  } catch (error) {
    next(error);
  }
};
