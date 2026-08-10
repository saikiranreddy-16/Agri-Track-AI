package com.agritrack.ai.domain.model

import com.google.gson.annotations.SerializedName

data class ApiResponse<T>(
    val success: Boolean,
    val message: String?,
    val data: T?
)

data class MachineLocation(
    val lat: Double? = 16.978,
    val lng: Double? = 79.432
)

data class Machine(
    @SerializedName("_id") val mongoId: String? = null,
    val id: String? = null,
    val name: String? = "Machine",
    val model: String? = "",
    val brand: String? = "",
    val type: String? = "Tractor",
    val status: String? = "Active",
    @SerializedName("fuel") val fuelLevelPercent: Int? = 75,
    @SerializedName("engineTemperature") val engineTemperatureC: Int? = 85,
    val batteryVoltage: Double? = 13.5,
    @SerializedName("healthScore") val healthScorePercent: Int? = 90,
    @SerializedName("speed") val speedKmh: Double? = 0.0,
    @SerializedName("workingHours") val hoursOperated: Double? = 100.0,
    val nextServiceHours: Int? = 50,
    val assignedDriverName: String? = null,
    val dailyIncome: Double? = 0.0,
    val dailyExpense: Double? = 0.0,
    val location: MachineLocation? = null,
    val lat: Double? = null,
    val lng: Double? = null,
    val imageUrl: String? = null
) {
    val displayId: String get() = mongoId ?: id ?: "m1"
    val safeName: String get() = name ?: "Agri Machine"
    val safeModel: String get() = model ?: brand ?: "2024 Model"
    val safeStatus: String get() = status ?: "Active"
    val safeFuel: Int get() = fuelLevelPercent ?: 50
    val safeHealth: Int get() = healthScorePercent ?: 90
    val safeTemp: Int get() = engineTemperatureC ?: 85
    val safeSpeed: Double get() = speedKmh ?: 0.0
    val safeIncome: Double get() = dailyIncome ?: 0.0
    val safeExpense: Double get() = dailyExpense ?: 0.0
    val safeLat: Double get() = location?.lat ?: lat ?: 16.978
    val safeLng: Double get() = location?.lng ?: lng ?: 79.432
}

data class Driver(
    @SerializedName("_id") val mongoId: String? = null,
    val id: String? = null,
    val name: String? = "Driver",
    val phone: String? = "",
    val licenseNumber: String? = "",
    val experienceYears: Int? = 5,
    val status: String? = "Active",
    val assignedMachineName: String? = null
)

data class Expense(
    @SerializedName("_id") val mongoId: String? = null,
    val id: String? = null,
    val machineId: String? = null,
    val category: String? = "General",
    val amount: Double? = 0.0,
    val date: String? = "",
    val notes: String? = "",
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

data class LoginRequest(
    val phone: String? = null,
    val email: String? = null,
    val password: String? = null,
    val pin: String? = null
)

data class LoginResponse(
    val success: Boolean,
    val message: String?,
    val token: String?,
    val data: LoginData?
)

data class LoginData(
    val user: UserData?,
    val token: String?
)

data class UserData(
    val _id: String?,
    val id: String?,
    val name: String?,
    val email: String?,
    val phone: String?,
    val role: String?
)
