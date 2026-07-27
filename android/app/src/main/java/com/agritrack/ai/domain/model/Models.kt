package com.agritrack.ai.domain.model

data class Machine(
    val id: String,
    val name: String,
    val model: String,
    val type: String, // e.g. "Tractor", "Harvester"
    val status: String, // "Active", "Idle", "Maintenance", "Offline"
    val fuelLevelPercent: Int,
    val engineTemperatureC: Int,
    val batteryVoltage: Double,
    val healthScorePercent: Int,
    val speedKmh: Double,
    val hoursOperated: Double,
    val nextServiceHours: Int,
    val assignedDriverName: String?,
    val dailyIncome: Double,
    val dailyExpense: Double,
    val lat: Double,
    val lng: Double,
    val imageUrl: String? = null
)

data class Driver(
    val id: String,
    val name: String,
    val phone: String,
    val licenseNumber: String,
    val experienceYears: Int,
    val status: String, // "On Duty", "Off Duty", "On Leave"
    val assignedMachineName: String?
)

data class Expense(
    val id: String,
    val machineId: String,
    val category: String, // "Diesel", "Service", "Tyres", "Oil", "Labour", "Driver Salary"
    val amount: Double,
    val date: String,
    val notes: String,
    val receiptUrl: String? = null
)

data class SummaryMetrics(
    val totalFleet: Int,
    val activeMachines: Int,
    val idleMachines: Int,
    val maintenanceMachines: Int,
    val totalIncomeToday: Double,
    val totalExpenseToday: Double,
    val netProfitToday: Double
)
