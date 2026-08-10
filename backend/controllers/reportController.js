import { getOperationsMetrics } from '../services/reportService.js';
import { successResponse } from '../utils/responseHandler.js';
import User from '../models/userModel.js';
import GPSDevice from '../models/gpsDeviceModel.js';
import DeviceAlert from '../models/deviceAlertModel.js';
import CustomerLocationMapping from '../models/customerLocationMappingModel.js';

// @desc    Get dynamically calculated operations report (without database table storage)
// @route   GET /api/v1/reports
// @access  Private
export const getOperationsReport = async (req, res, next) => {
  try {
    const { timeframe } = req.query;
    const ownerId = req.user.role === 'Farm Admin' ? req.user._id : null;

    if (timeframe) {
      const data = await getOperationsMetrics(timeframe, ownerId);
      return successResponse(res, 200, `${timeframe} report calculated successfully`, data);
    }

    // Fallback: calculate all standard timeframes to ease client side consumption
    const today = await getOperationsMetrics('Today', ownerId);
    const yesterday = await getOperationsMetrics('Yesterday', ownerId);
    const weekly = await getOperationsMetrics('Weekly', ownerId);
    const monthly = await getOperationsMetrics('Monthly', ownerId);

    return successResponse(res, 200, 'Operations reports calculated successfully', {
      Today: today,
      Yesterday: yesterday,
      Weekly: weekly,
      Monthly: monthly,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export reports in CSV or JSON
// @route   GET /api/v1/reports/export/:type
// @access  Private (Company Admin only)
export const exportReport = async (req, res, next) => {
  try {
    const { type } = req.params;
    const { format = 'csv' } = req.query;

    let data = [];
    let csvContent = '';
    let filename = `${type}_report_${Date.now()}`;

    if (type === 'customers') {
      const customers = await User.find({ role: 'Farm Admin' }).lean();
      if (format === 'csv') {
        csvContent = 'Name,Phone,Alternate Phone,Email,Aadhaar,GST,State,District\n';
        for (const c of customers) {
          const map = await CustomerLocationMapping.findOne({ customer: c._id }).populate('state district mandal village').lean();
          const stateStr = map?.state?.name || '';
          const distStr = map?.district?.name || '';
          csvContent += `"${c.name}","${c.phone}","${c.alternatePhone || ''}","${c.email || ''}","${c.aadhaarNumber || ''}","${c.gstNumber || ''}","${stateStr}","${distStr}"\n`;
        }
      } else {
        data = customers;
      }
    } else if (type === 'devices') {
      const devices = await GPSDevice.find({}).lean();
      if (format === 'csv') {
        csvContent = 'Device ID,IMEI,SIM Number,SIM ICCID,SIM Provider,Installer,Install Location,Odometer,Warranty Expiry,Detailed Live Status,Status\n';
        for (const d of devices) {
          csvContent += `"${d.deviceId}","${d.imei}","${d.simNumber || ''}","${d.simIccid || ''}","${d.simProvider || ''}","${d.installerName || ''}","${d.installationLocation || ''}",${d.vehicleOdometer || 0},"${d.warrantyExpiry ? d.warrantyExpiry.toISOString() : ''}","${d.detailedLiveStatus || ''}","${d.activationStatus || ''}"\n`;
        }
      } else {
        data = devices;
      }
    } else if (type === 'alerts') {
      const alerts = await DeviceAlert.find({}).populate('customerId').lean();
      if (format === 'csv') {
        csvContent = 'Timestamp,Device ID,Customer,Category,Severity,Status,Exact Latitude,Exact Longitude,Address\n';
        for (const a of alerts) {
          const clientName = a.customerId?.name || 'Unknown';
          const addr = `"${a.exactLocation?.address || ''}"`.replace(/\n/g, ' ');
          csvContent += `"${a.timestamp ? a.timestamp.toISOString() : ''}","${a.deviceId}","${clientName}","${a.category}","${a.severity}","${a.status}",${a.exactLocation?.lat || 0},${a.exactLocation?.lng || 0},${addr}\n`;
        }
      } else {
        data = alerts;
      }
    } else if (type === 'offline') {
      const devices = await GPSDevice.find({ connectionStatus: 'Offline' }).populate('owner').lean();
      if (format === 'csv') {
        csvContent = 'Device ID,IMEI,SIM Number,Owner Name,Owner Phone,Last Communication Time\n';
        for (const d of devices) {
          const ownerName = d.owner?.name || 'Unassigned';
          const ownerPhone = d.owner?.phone || 'N/A';
          csvContent += `"${d.deviceId}","${d.imei}","${d.simNumber || ''}","${ownerName}","${ownerPhone}","${d.lastCommunicationTime ? d.lastCommunicationTime.toISOString() : 'Never'}"\n`;
        }
      } else {
        data = devices;
      }
    } else {
      res.status(400);
      return next(new Error('Invalid report type. Supported types: customers, devices, alerts, offline.'));
    }

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      return res.status(200).send(csvContent);
    } else {
      return successResponse(res, 200, `${type} report compiled`, data);
    }
  } catch (error) {
    next(error);
  }
};
