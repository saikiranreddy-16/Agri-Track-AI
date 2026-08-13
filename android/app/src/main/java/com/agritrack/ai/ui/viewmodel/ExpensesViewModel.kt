package com.agritrack.ai.ui.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.agritrack.ai.data.remote.RetrofitClient
import com.agritrack.ai.domain.model.AddDieselExpenseRequest
import com.agritrack.ai.domain.model.Expense
import kotlinx.coroutines.launch

sealed interface ExpensesState {
    object Idle : ExpensesState
    object Loading : ExpensesState
    data class Success(val expenses: List<Expense>) : ExpensesState
    data class Error(val message: String) : ExpensesState
}

class ExpensesViewModel : ViewModel() {
    var state: ExpensesState by mutableStateOf(ExpensesState.Idle)
        private set

    val expenseList = mutableStateListOf<Expense>()

    init {
        fetchExpenses()
    }

    fun fetchExpenses() {
        viewModelScope.launch {
            state = ExpensesState.Loading
            try {
                val response = RetrofitClient.instance.getExpenses()
                if (response.isSuccessful && response.body()?.success == true) {
                    val remoteItems = response.body()?.data ?: emptyList()
                    expenseList.clear()
                    if (remoteItems.isNotEmpty()) {
                        expenseList.addAll(remoteItems)
                    } else {
                        // Fallback defaults if DB empty
                        expenseList.addAll(getDefaultDemoExpenses())
                    }
                    state = ExpensesState.Success(expenseList)
                } else {
                    expenseList.clear()
                    expenseList.addAll(getDefaultDemoExpenses())
                    state = ExpensesState.Success(expenseList)
                }
            } catch (e: Exception) {
                if (expenseList.isEmpty()) {
                    expenseList.addAll(getDefaultDemoExpenses())
                }
                state = ExpensesState.Success(expenseList)
            }
        }
    }

    fun addExpense(vehicleId: String?, qty: Double, rate: Double, pump: String, notes: String) {
        viewModelScope.launch {
            val request = AddDieselExpenseRequest(
                vehicleId = vehicleId,
                dieselQuantity = qty,
                costPerLitre = rate,
                petrolPumpName = pump,
                remarks = notes
            )
            try {
                val response = RetrofitClient.instance.addDieselExpense(request)
                if (response.isSuccessful && response.body()?.data != null) {
                    val newExp = response.body()?.data!!
                    expenseList.add(0, newExp)
                } else {
                    // Add locally
                    expenseList.add(
                        0,
                        Expense(
                            category = "Fuel",
                            title = "Diesel Refill (${qty}L)",
                            totalCost = qty * rate,
                            date = "Just now",
                            remarks = notes,
                            machineName = pump.ifBlank { "Vehicle" }
                        )
                    )
                }
            } catch (e: Exception) {
                expenseList.add(
                    0,
                    Expense(
                        category = "Fuel",
                        title = "Diesel Refill (${qty}L)",
                        totalCost = qty * rate,
                        date = "Just now",
                        remarks = notes,
                        machineName = pump.ifBlank { "Vehicle" }
                    )
                )
            }
        }
    }

    private fun getDefaultDemoExpenses(): List<Expense> {
        return listOf(
            Expense(category = "Fuel", title = "Diesel Refill (200L)", totalCost = 18500.0, date = "Today", machineName = "John Deere 5042D"),
            Expense(category = "Maintenance", title = "Engine Oil Service", totalCost = 4200.0, date = "Yesterday", machineName = "Mahindra Yuvo"),
            Expense(category = "Wages", title = "Driver Daily Allowance", totalCost = 1200.0, date = "Yesterday", machineName = "Preet 987 Combine"),
            Expense(category = "Spare Parts", title = "Hydraulic Hose Replacement", totalCost = 3500.0, date = "08 Aug 2026", machineName = "Swaraj 855 FE")
        )
    }
}
