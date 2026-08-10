import Field from '../models/fieldModel.js';
import { successResponse } from '../utils/responseHandler.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Get all fields
// @route   GET /api/v1/fields
// @access  Private
export const getFields = async (req, res, next) => {
  try {
    const query = req.user.role === 'Farm Admin' ? { owner: req.user._id } : {};
    const fields = await Field.find(query).populate('machineAssigned', 'name registration type');
    return successResponse(res, 200, 'Fields retrieved successfully', fields);
  } catch (error) {
    next(error);
  }
};

// @desc    Create field
// @route   POST /api/v1/fields
// @access  Private (Admin, Farm Owner, Manager)
export const createField = async (req, res, next) => {
  try {
    const { name, area, crop, machineAssigned, status, boundaries } = req.body;

    const owner = req.user.role === 'Farm Admin' ? req.user._id : req.body.owner;

    const field = await Field.create({
      name,
      area,
      crop,
      owner,
      machineAssigned: machineAssigned || null,
      status,
      boundaries,
    });

    await logActivity(
      req.user._id,
      req.user.name,
      'Settings Update',
      `Registered new field block: ${name} (${area} ha, crop: ${crop})`,
      req
    );

    return successResponse(res, 201, 'Field created successfully', field);
  } catch (error) {
    next(error);
  }
};

// @desc    Update field
// @route   PUT /api/v1/fields/:id
// @access  Private (Admin, Farm Owner, Manager)
export const updateField = async (req, res, next) => {
  try {
    const field = await Field.findById(req.params.id);
    if (!field) {
      res.status(404);
      return next(new Error('Field not found'));
    }

    if (req.user.role === 'Farm Admin' && field.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Access denied. This field does not belong to your account.'));
    }

    const updatedField = await Field.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    await logActivity(
      req.user._id,
      req.user.name,
      'Settings Update',
      `Updated details/boundaries for field: ${updatedField.name}`,
      req
    );

    return successResponse(res, 200, 'Field updated successfully', updatedField);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete field
// @route   DELETE /api/v1/fields/:id
// @access  Private (Admin, Farm Owner)
export const deleteField = async (req, res, next) => {
  try {
    const field = await Field.findById(req.params.id);
    if (!field) {
      res.status(404);
      return next(new Error('Field not found'));
    }

    if (req.user.role === 'Farm Admin' && field.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Access denied. This field does not belong to your account.'));
    }

    await Field.findByIdAndDelete(req.params.id);

    await logActivity(
      req.user._id,
      req.user.name,
      'Settings Update',
      `Deleted field registry: ${field.name}`,
      req
    );

    return successResponse(res, 200, 'Field deleted successfully');
  } catch (error) {
    next(error);
  }
};
