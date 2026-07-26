import VehicleIncome from '../models/incomeModel.js';
import DieselExpense from '../models/dieselExpenseModel.js';
import ServiceExpense from '../models/serviceExpenseModel.js';
import OperatingExpense from '../models/operatingExpenseModel.js';

export const addVehicleIncome = async (req, res, next) => {
  try {
    const { vehicleId, date, source, amount, remarks } = req.body;

    const income = await VehicleIncome.create({
      vehicleId,
      customerId: req.user._id,
      date: date || new Date(),
      source: source || 'Custom Hire',
      amount: Number(amount),
      remarks,
    });

    return res.status(201).json({ success: true, data: income });
  } catch (err) {
    next(err);
  }
};

export const getProfitLossSummary = async (req, res, next) => {
  try {
    const { vehicleId } = req.query;
    const filter = { customerId: req.user._id };
    if (vehicleId) filter.vehicleId = vehicleId;

    const [dieselList, serviceList, operatingList, incomeList] = await Promise.all([
      DieselExpense.find(filter),
      ServiceExpense.find(filter),
      OperatingExpense.find(filter),
      VehicleIncome.find(filter),
    ]);

    const totalDieselExpense = dieselList.reduce((acc, curr) => acc + curr.totalCost, 0);
    const totalServiceExpense = serviceList.reduce((acc, curr) => acc + curr.serviceCost, 0);
    const totalOperatingExpense = operatingList.reduce((acc, curr) => acc + curr.amount, 0);
    const totalIncome = incomeList.reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpense = totalDieselExpense + totalServiceExpense + totalOperatingExpense;
    const hasIncomeLogged = incomeList.length > 0;
    const netProfit = hasIncomeLogged ? totalIncome - totalExpense : null;

    return res.status(200).json({
      success: true,
      data: {
        hasIncomeLogged,
        totalIncome,
        totalDieselExpense,
        totalServiceExpense,
        totalOperatingExpense,
        totalExpense,
        netProfit,
        incomeList,
        breakdown: [
          { name: 'Diesel', amount: totalDieselExpense },
          { name: 'Service', amount: totalServiceExpense },
          { name: 'Operating', amount: totalOperatingExpense },
        ],
      },
    });
  } catch (err) {
    next(err);
  }
};
