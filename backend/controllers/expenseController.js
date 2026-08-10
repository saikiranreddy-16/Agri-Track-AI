import DieselExpense from '../models/dieselExpenseModel.js';
import ServiceExpense from '../models/serviceExpenseModel.js';
import OperatingExpense from '../models/operatingExpenseModel.js';
import Machine from '../models/machineModel.js';
import NotificationHistory from '../models/notificationHistoryModel.js';

// DIESEL EXPENSES
export const addDieselExpense = async (req, res, next) => {
  try {
    const { vehicleId, date, dieselQuantity, costPerLitre, petrolPumpName, billPhoto, remarks } = req.body;

    const totalCost = Number(dieselQuantity) * Number(costPerLitre);
    const expense = await DieselExpense.create({
      vehicleId,
      customerId: req.user._id,
      date: date || new Date(),
      dieselQuantity: Number(dieselQuantity),
      costPerLitre: Number(costPerLitre),
      totalCost,
      petrolPumpName,
      billPhoto: billPhoto || '',
      remarks,
    });

    // Optionally update remaining diesel on machine
    const machine = await Machine.findById(vehicleId);
    if (machine) {
      machine.remainingDieselLitres = Math.min(100, (machine.remainingDieselLitres || 0) + Number(dieselQuantity));
      await machine.save();
    }

    // Create Notification Log
    await NotificationHistory.create({
      userId: req.user._id,
      vehicleId,
      title: 'Diesel Added',
      message: `Added ${dieselQuantity}L diesel worth ₹${totalCost.toFixed(2)} for ${machine?.name || 'vehicle'}.`,
      eventType: 'Diesel Added',
      severity: 'Info',
    });

    return res.status(201).json({ success: true, data: expense });
  } catch (err) {
    next(err);
  }
};

export const getDieselExpenses = async (req, res, next) => {
  try {
    const { vehicleId, period, startDate, endDate } = req.query;
    const filter = { customerId: req.user._id };

    if (vehicleId) filter.vehicleId = vehicleId;

    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (period === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filter.date = { $gte: today };
    } else if (period === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filter.date = { $gte: weekAgo };
    } else if (period === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filter.date = { $gte: monthAgo };
    }

    const expenses = await DieselExpense.find(filter).sort({ date: -1 }).populate('vehicleId', 'name brand model registration');

    // Summary calculations
    const totalCost = expenses.reduce((acc, curr) => acc + curr.totalCost, 0);
    const totalLitres = expenses.reduce((acc, curr) => acc + curr.dieselQuantity, 0);
    const avgCostPerLitre = totalLitres > 0 ? totalCost / totalLitres : 0;

    return res.status(200).json({
      success: true,
      summary: {
        totalCost,
        totalLitres,
        avgCostPerLitre,
      },
      data: expenses,
    });
  } catch (err) {
    next(err);
  }
};

// SERVICE EXPENSES
export const addServiceExpense = async (req, res, next) => {
  try {
    const { vehicleId, date, serviceCost, category, description, workshopName, engineHours, billPhoto, remarks } = req.body;

    const expense = await ServiceExpense.create({
      vehicleId,
      customerId: req.user._id,
      date: date || new Date(),
      serviceCost: Number(serviceCost),
      category: category || 'Others',
      description,
      workshopName,
      engineHours: Number(engineHours) || 0,
      billPhoto: billPhoto || '',
      remarks,
    });

    const machine = await Machine.findById(vehicleId);
    if (machine) {
      machine.lastServiceHours = Number(engineHours) || machine.currentEngineHours;
      machine.lastServiceDate = new Date();
      machine.serviceStatus = 'Good';
      await machine.save();
    }

    // Create Notification Log
    await NotificationHistory.create({
      userId: req.user._id,
      vehicleId,
      title: 'Service Added',
      message: `Recorded ${category} service costing ₹${serviceCost} for ${machine?.name || 'vehicle'}.`,
      eventType: 'Service Added',
      severity: 'Info',
    });

    return res.status(201).json({ success: true, data: expense });
  } catch (err) {
    next(err);
  }
};

export const getServiceExpenses = async (req, res, next) => {
  try {
    const { vehicleId, category } = req.query;
    const filter = { customerId: req.user._id };

    if (vehicleId) filter.vehicleId = vehicleId;
    if (category && category !== 'All') filter.category = category;

    const expenses = await ServiceExpense.find(filter).sort({ date: -1 }).populate('vehicleId', 'name brand model registration currentEngineHours serviceStatus nextServiceDate');

    const totalServiceCost = expenses.reduce((acc, curr) => acc + curr.serviceCost, 0);

    return res.status(200).json({
      success: true,
      summary: {
        totalServiceCost,
        count: expenses.length,
      },
      data: expenses,
    });
  } catch (err) {
    next(err);
  }
};

// OPERATING EXPENSES
export const addOperatingExpense = async (req, res, next) => {
  try {
    const { vehicleId, date, category, amount, receiptPhoto, remarks } = req.body;

    const expense = await OperatingExpense.create({
      vehicleId,
      customerId: req.user._id,
      date: date || new Date(),
      category: category || 'Miscellaneous',
      amount: Number(amount),
      receiptPhoto: receiptPhoto || '',
      remarks,
    });

    return res.status(201).json({ success: true, data: expense });
  } catch (err) {
    next(err);
  }
};

export const getOperatingExpenses = async (req, res, next) => {
  try {
    const { vehicleId } = req.query;
    const filter = { customerId: req.user._id };
    if (vehicleId) filter.vehicleId = vehicleId;

    const expenses = await OperatingExpense.find(filter).sort({ date: -1 }).populate('vehicleId', 'name brand model');
    const totalAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    return res.status(200).json({
      success: true,
      summary: { totalAmount },
      data: expenses,
    });
  } catch (err) {
    next(err);
  }
};
