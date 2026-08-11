package com.agritrack.ai.ui.screens.expenses

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.agritrack.ai.ui.theme.*

data class DemoExpense(
    val title: String,
    val category: String,
    val amount: Double,
    val date: String,
    val machineName: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExpensesScreen(
    userRole: String? = null,
    machines: List<com.agritrack.ai.domain.model.Machine> = emptyList()
) {
    val isCustomer = userRole != null && userRole != "Company Admin" && userRole != "Admin"
    var showAddDialog by remember { mutableStateOf(false) }
    var selectedMachine by remember { mutableStateOf("John Deere 5042D") }
    var category by remember { mutableStateOf("Fuel") }
    var amountText by remember { mutableStateOf("") }
    var notesText by remember { mutableStateOf("") }

    val vehicleOptions = if (machines.isNotEmpty()) {
        machines.map { it.safeName }
    } else {
        listOf("John Deere 5042D")
    }

    val allExpensesList = remember {
        mutableStateListOf(
            DemoExpense("Diesel Refill (200L)", "Fuel", 18500.0, "Today", "John Deere 5042D"),
            DemoExpense("Engine Oil Service", "Maintenance", 4200.0, "Yesterday", "Mahindra Yuvo"),
            DemoExpense("Driver Daily Allowance", "Wages", 1200.0, "Yesterday", "Preet 987 Combine"),
            DemoExpense("Hydraulic Hose Replacement", "Spare Parts", 3500.0, "08 Aug 2026", "Swaraj 855 FE")
        )
    }

    // Customer only sees expenditures for their assigned vehicle(s)
    val displayExpenses = if (isCustomer) {
        val allowedNames = vehicleOptions.map { it.lowercase() }
        allExpensesList.filter { exp ->
            allowedNames.any { exp.machineName.lowercase().contains(it) || it.contains(exp.machineName.lowercase()) }
        }
    } else {
        allExpensesList
    }

    val totalExpense = displayExpenses.sumOf { it.amount }

    if (showAddDialog && isCustomer) {
        AlertDialog(
            onDismissRequest = { showAddDialog = false },
            title = { Text("Log Vehicle Expenditure", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Select Vehicle", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Column {
                        vehicleOptions.forEach { vehicle ->
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 2.dp)
                            ) {
                                RadioButton(
                                    selected = (selectedMachine == vehicle),
                                    onClick = { selectedMachine = vehicle }
                                )
                                Text(text = vehicle, fontSize = 13.sp)
                            }
                        }
                    }

                    OutlinedTextField(
                        value = amountText,
                        onValueChange = { amountText = it },
                        label = { Text("Amount (₹)") },
                        placeholder = { Text("e.g. 5000") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = notesText,
                        onValueChange = { notesText = it },
                        label = { Text("Expenditure Description") },
                        placeholder = { Text("e.g. Fuel Refill, Servicing") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val parsedAmt = amountText.trim().toDoubleOrNull() ?: 0.0
                        if (parsedAmt > 0) {
                            allExpensesList.add(
                                0,
                                DemoExpense(
                                    title = notesText.ifBlank { "Vehicle Maintenance" },
                                    category = category,
                                    amount = parsedAmt,
                                    date = "Today",
                                    machineName = selectedMachine
                                )
                            )
                            showAddDialog = false
                            amountText = ""
                            notesText = ""
                        }
                    },
                    enabled = amountText.trim().isNotEmpty() && (amountText.trim().toDoubleOrNull() ?: 0.0) > 0,
                    colors = ButtonDefaults.buttonColors(containerColor = AgroGreenPrimary)
                ) {
                    Text("Save Expenditure")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = if (isCustomer) "My Vehicle Expenditures" else "Fleet Expenditures Overview",
                            fontWeight = FontWeight.Bold,
                            fontSize = 20.sp
                        )
                        Text(
                            text = if (isCustomer) "Personal Farm Vehicle Costs & Refills" else "Read-Only Enterprise Expenditure Log",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                actions = {
                    if (isCustomer) {
                        IconButton(onClick = { showAddDialog = true }) {
                            Icon(Icons.Default.AddCircle, contentDescription = "Add Expense", tint = AgroAmberAccent)
                        }
                    }
                }
            )
        },
        floatingActionButton = {
            if (isCustomer) {
                ExtendedFloatingActionButton(
                    onClick = { showAddDialog = true },
                    icon = { Icon(Icons.Default.Add, contentDescription = null) },
                    text = { Text("Log Expenditure") },
                    containerColor = AgroGreenPrimary,
                    contentColor = Color.White
                )
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp)
        ) {
            // Summary Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = if (isCustomer) "My Logged Expenditures" else "Company Logged Expenditures",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text("₹${String.format("%,.0f", totalExpense)}", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = AgroAmberAccent)
                    }
                    Icon(Icons.Default.AccountBalanceWallet, contentDescription = null, modifier = Modifier.size(36.dp), tint = AgroGreenPrimary)
                }
            }

            if (!isCustomer) {
                Surface(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    shape = RoundedCornerShape(10.dp),
                    color = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.4f)
                ) {
                    Text(
                        text = "🔒 Private Customer Records: Company Admins have read-only access. Expenditure logging is performed directly by Farm Customers.",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSecondaryContainer,
                        modifier = Modifier.padding(10.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(displayExpenses) { expense ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(expense.title, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                                Text("${expense.machineName} • ${expense.date}", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            Text("₹${String.format("%,.0f", expense.amount)}", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = AgroAmberAccent)
                        }
                    }
                }
            }
        }
    }
}
