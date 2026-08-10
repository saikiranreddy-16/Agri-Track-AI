package com.agritrack.ai.ui.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.agritrack.ai.data.remote.RetrofitClient
import com.agritrack.ai.domain.model.Machine
import com.agritrack.ai.domain.model.SummaryMetrics
import kotlinx.coroutines.launch

sealed class DashboardState {
    object Loading : DashboardState()
    data class Success(val machines: List<Machine>, val metrics: SummaryMetrics) : DashboardState()
    data class Error(val message: String) : DashboardState()
}

class DashboardViewModel : ViewModel() {
    var state by mutableStateOf<DashboardState>(DashboardState.Loading)
        private set

    fun fetchDashboardData() {
        state = DashboardState.Loading
        viewModelScope.launch {
            try {
                val response = RetrofitClient.instance.getMachines()
                if (response.isSuccessful && response.body()?.success == true) {
                    val machines = response.body()?.data ?: emptyList()
                    val metrics = calculateMetrics(machines)
                    state = DashboardState.Success(machines, metrics)
                } else {
                    state = DashboardState.Error("Failed to fetch machines: ${response.code()}")
                }
            } catch (e: Exception) {
                state = DashboardState.Error(e.localizedMessage ?: "Connectivity error")
            }
        }
    }

    private fun calculateMetrics(machines: List<Machine>): SummaryMetrics {
        return SummaryMetrics(
            totalFleet = machines.size,
            activeMachines = machines.count { it.safeStatus == "Active" || it.safeStatus == "Working" },
            idleMachines = machines.count { it.safeStatus == "Idle" },
            maintenanceMachines = machines.count { it.safeStatus == "Maintenance" },
            totalIncomeToday = machines.sumOf { it.safeIncome },
            totalExpenseToday = machines.sumOf { it.safeExpense },
            netProfitToday = machines.sumOf { it.safeIncome } - machines.sumOf { it.safeExpense }
        )
    }
}
