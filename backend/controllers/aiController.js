import Machine from '../models/machineModel.js';
import Farm from '../models/farmModel.js';
import Job from '../models/jobModel.js';
import Alert from '../models/alertModel.js';
import Maintenance from '../models/maintenanceModel.js';
import { getOperationsMetrics } from '../services/reportService.js';
import { successResponse } from '../utils/responseHandler.js';

// @desc    Secure query to operations AI copilot (filters data by owner first)
// @route   POST /api/v1/ai/query
// @access  Private
export const queryAI = async (req, res, next) => {
  const { prompt } = req.body;

  if (!prompt || !prompt.trim()) {
    res.status(400);
    return next(new Error('Query prompt is required'));
  }

  try {
    const isFarmAdmin = req.user.role === 'Farm Admin';
    const ownerId = isFarmAdmin ? req.user._id : null;

    // 1. Authenticate & Filter MongoDB records
    let machinesQuery = {};
    let farmsQuery = {};
    if (ownerId) {
      machinesQuery = { owner: ownerId };
      farmsQuery = { owner: ownerId };
    }

    const machines = await Machine.find(machinesQuery).lean();
    const machineIds = machines.map(m => m._id);

    const farms = await Farm.find(farmsQuery).lean();
    const jobs = await Job.find({ machineId: { $in: machineIds } }).lean();
    const alerts = await Alert.find({ machineId: { $in: machineIds } }).lean();
    const maintenance = await Maintenance.find({ machineId: { $in: machineIds } }).lean();

    // Calculate dynamic reports
    const reportToday = await getOperationsMetrics('Today', ownerId);
    const reportWeekly = await getOperationsMetrics('Weekly', ownerId);
    const reportMonthly = await getOperationsMetrics('Monthly', ownerId);

    // 2. Create filtered JSON (This is the only data that would be sent to the AI model)
    const filteredJSON = {
      userRole: req.user.role,
      userName: req.user.name,
      farmsCount: farms.length,
      machinesCount: machines.length,
      activeFarms: farms.map(f => f.name),
      machines: machines.map(m => ({
        id: m._id,
        name: m.name,
        type: m.type,
        chassisNumber: m.chassisNumber || m.registration,
        status: m.status,
        fuel: m.fuel,
        battery: m.battery,
        speed: m.speed,
        workingHours: m.workingHours,
        distanceTravelled: m.distanceTravelled,
        currentAddress: m.currentAddress,
      })),
      jobs: jobs.map(j => ({ title: j.title, status: j.status, progress: j.progress })),
      alerts: alerts.map(a => ({ type: a.type, message: a.message, priority: a.priority, status: a.status })),
      maintenance: maintenance.map(m => ({ task: m.task, status: m.status, date: m.date })),
      reportToday,
      reportWeekly,
      reportMonthly,
    };

    // 3. Process Prompt using ONLY the filtered JSON data (Simulating LLM behavior)
    let aiResponseText = '';
    const cleanPrompt = prompt.toLowerCase();

    if (cleanPrompt.includes('work') || cleanPrompt.includes("today's work") || cleanPrompt.includes('today')) {
      const activeCount = filteredJSON.machines.filter(m => m.status === 'Working').length;
      const machineList = filteredJSON.machines
        .map(m => `* **${m.name}** (${m.type}): Status: ${m.status}, Fuel: ${m.fuel}%, Engine: ${m.workingHours}h`)
        .join('\n');
      
      aiResponseText = `Here is your operations summary for today:
      
* **Total Farms**: ${filteredJSON.farmsCount} (${filteredJSON.activeFarms.join(', ') || 'None'})
* **Total Vehicles**: ${filteredJSON.machinesCount} (${activeCount} currently active/working)
* **Active Jobs**: ${filteredJSON.jobs.filter(j => j.status === 'In Progress').length} in progress
* **Recent Alerts**: ${filteredJSON.alerts.filter(a => a.status === 'Active').length} active alerts

**Machinery Telemetry & Status**:
${machineList || 'No vehicles found in your farm context.'}`;

    } else if (cleanPrompt.includes('weekly') || cleanPrompt.includes('week')) {
      const totalFuel = filteredJSON.reportWeekly.reduce((sum, item) => sum + item.fuel, 0);
      const totalDistance = filteredJSON.reportWeekly.reduce((sum, item) => sum + item.distance, 0);
      const totalHours = filteredJSON.reportWeekly.reduce((sum, item) => sum + item.hours, 0);
      
      aiResponseText = `### Weekly Operational Performance Report (Filtered for ${filteredJSON.userName})
      
| Parameter | Value | Details |
| :--- | :--- | :--- |
| **Total Distance Covered** | ${totalDistance.toFixed(1)} km | Calculated from GPS coordinate history |
| **Total Fuel Consumed** | ${totalFuel.toFixed(1)} L | Aggregate engine burn rate calculations |
| **Total Engine Hours** | ${totalHours.toFixed(1)} hrs | Machine task timelines |
| **Active Machinery** | ${filteredJSON.machinesCount} assets | Tractor/harvester units deployed |

All operations are progressing on schedule. We registered ${filteredJSON.alerts.filter(a => a.priority === 'Critical').length} critical hardware warnings this week.`;

    } else if (cleanPrompt.includes('monthly') || cleanPrompt.includes('month')) {
      const totalFuel = filteredJSON.reportMonthly.reduce((sum, item) => sum + item.fuel, 0);
      const totalDistance = filteredJSON.reportMonthly.reduce((sum, item) => sum + item.distance, 0);
      const totalHours = filteredJSON.reportMonthly.reduce((sum, item) => sum + item.hours, 0);
      
      aiResponseText = `### Monthly Fleet Efficiency Review (Filtered for ${filteredJSON.userName})
      
* **Aggregate Distance**: ${totalDistance.toFixed(1)} km covered by fleet.
* **Aggregate Fuel Consumption**: ${totalFuel.toFixed(1)} Litres.
* **Total Machine Hours Logged**: ${totalHours.toFixed(1)} hours.
* **Maintenance Events Scheduled**: ${filteredJSON.maintenance.length} tasks registered.`;

    } else if (cleanPrompt.includes('fuel')) {
      const totalFuelToday = filteredJSON.reportToday.reduce((sum, item) => sum + item.fuel, 0);
      const lowFuelMachines = filteredJSON.machines.filter(m => m.fuel < 20);
      const lowFuelList = lowFuelMachines
        .map(m => `* **${m.name}** is at **${m.fuel}%** fuel capacity.`)
        .join('\n');
      
      aiResponseText = `**Fuel Consumption Diagnostics (Today)**:
      
* **Aggregate Burned**: ${totalFuelToday} Litres across the fleet today.
* **Low Fuel Warnings**:
${lowFuelList || 'No vehicles are below 20% fuel capacity.'}`;

    } else if (cleanPrompt.includes('machine worked') || cleanPrompt.includes('worked the most') || cleanPrompt.includes('tractor')) {
      if (filteredJSON.machines.length === 0) {
        aiResponseText = `No machinery records found for account: ${filteredJSON.userName}.`;
      } else {
        const sorted = [...filteredJSON.machines].sort((a, b) => b.workingHours - a.workingHours);
        const top = sorted[0];
        aiResponseText = `Based on log records, the asset that has worked the most is the **${top.name}** (${top.type}).
        
* **Total Hours Logged**: ${top.workingHours} Hours active.
* **Status**: ${top.status}
* **Current Fuel Level**: ${top.fuel}%
* **Total Distance**: ${top.distanceTravelled} km`;
      }
    } else {
      aiResponseText = `Hello ${filteredJSON.userName}! I am your AgriTrack Farm Operations AI Copilot.
I can analyze your fleet data, fuel usage, and job progress based on the records in your account.
Your account has ${filteredJSON.machinesCount} machines and ${filteredJSON.farmsCount} farms.

Try asking:
- "Show today's work"
- "Weekly report"
- "Monthly report"
- "Fuel used today"
- "Which machine worked the most?"`;
    }

    return successResponse(res, 200, 'AI response generated', {
      response: aiResponseText,
    });
  } catch (error) {
    next(error);
  }
};
