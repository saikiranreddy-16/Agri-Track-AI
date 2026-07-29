package com.agritrack.ai.ui.screens.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.agritrack.ai.domain.model.Machine
import com.agritrack.ai.domain.model.SummaryMetrics
import com.agritrack.ai.ui.components.VehicleGaugeWidget
import com.agritrack.ai.ui.theme.*

import androidx.compose.runtime.*
import com.agritrack.ai.data.remote.RetrofitClient

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    authToken: String,
    onNavigateToMachine: (String) -> Unit = {},
    onVoiceAssistClick: () -> Unit = {}
) {
    var machinesList by remember { mutableStateOf<List<Machine>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(authToken) {
        try {
            val response = RetrofitClient.instance.getMachines("Bearer $authToken")
            if (response.isSuccessful && response.body()?.success == true) {
                machinesList = response.body()?.data ?: emptyList()
            } else {
                errorMessage = "Server returned error code: ${response.code()}"
            }
        } catch (e: Exception) {
            errorMessage = e.localizedMessage ?: "Failed to connect to server"
        } finally {
            isLoading = false
        }
    }

    val metrics = SummaryMetrics(
        totalFleet = machinesList.size,
        activeMachines = machinesList.count { it.safeStatus == "Active" || it.safeStatus == "Working" },
        idleMachines = machinesList.count { it.safeStatus == "Idle" },
        maintenanceMachines = machinesList.count { it.safeStatus == "Maintenance" },
        totalIncomeToday = machinesList.sumOf { it.safeIncome },
        totalExpenseToday = machinesList.sumOf { it.safeExpense },
        netProfitToday = machinesList.sumOf { it.safeIncome } - machinesList.sumOf { it.safeExpense }
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("AgriTrack AI", fontWeight = FontWeight.Bold, fontSize = 20.sp)
                        Text("Commercial Farm Fleet Operations", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                },
                actions = {
                    IconButton(onClick = onVoiceAssistClick) {
                        Icon(Icons.Default.Mic, contentDescription = "Voice Assistant", tint = AgroAmberAccent)
                    }
                    IconButton(onClick = {}) {
                        Icon(Icons.Default.Notifications, contentDescription = "Notifications")
                    }
                }
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp)
        ) {
            // Weather Header Bar
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
                ) {
                    Row(
                        modifier = Modifier
                            .padding(16.dp)
                            .fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.WbSunny, contentDescription = "Weather", tint = AgroAmberAccent)
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text("Guntur Farm Sector 4", fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                                Text("31°C • Humidity 65% • Rain 10%", fontSize = 12.sp, color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f))
                            }
                        }
                        Text("CLEAR", fontWeight = FontWeight.Bold, color = AgroGreenPrimary)
                    }
                }
            }

            // Financial Summary Card (Income - Expense = Net Profit)
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = AgroGreenPrimary)
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Text("Today's Net Profit", color = Color.White.copy(alpha = 0.8f), fontSize = 13.sp)
                        Text(
                            text = "₹${String.format("%,.0f", metrics.netProfitToday)}",
                            color = Color.White,
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("Income Today", color = Color.White.copy(alpha = 0.7f), fontSize = 11.sp)
                                Text("₹${String.format("%,.0f", metrics.totalIncomeToday)}", color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
                            }
                            Column {
                                Text("Expenses Today", color = Color.White.copy(alpha = 0.7f), fontSize = 11.sp)
                                Text("₹${String.format("%,.0f", metrics.totalExpenseToday)}", color = AgroAmberAccent, fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
                            }
                            Column {
                                Text("Active Fleet", color = Color.White.copy(alpha = 0.7f), fontSize = 11.sp)
                                Text("${metrics.activeMachines}/${metrics.totalFleet}", color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
                            }
                        }
                    }
                }
            }

            // Fleet Overview Section Title
            item {
                Text(
                    text = "Live Vehicle Digital Dashboards",
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    modifier = Modifier.padding(top = 16.dp, bottom = 8.dp)
                )
            }

            // Machine Dashboard Cards
            items(machinesList) { machine ->
                Card(
                    onClick = { onNavigateToMachine(machine.displayId) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(machine.safeName, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                Text(machine.safeModel, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            AssistChip(
                                onClick = {},
                                label = { Text(machine.safeStatus, fontSize = 11.sp) },
                                leadingIcon = {
                                    Icon(
                                        imageVector = if (machine.safeStatus == "Active" || machine.safeStatus == "Working") Icons.Default.CheckCircle else Icons.Default.Pause,
                                        contentDescription = null,
                                        modifier = Modifier.size(14.dp)
                                    )
                                }
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Visual Gauges Row
                        Row(modifier = Modifier.fillMaxWidth()) {
                            VehicleGaugeWidget(
                                title = "Fuel",
                                valueText = "${machine.safeFuel}%",
                                percentValue = machine.safeFuel / 100f,
                                gaugeColor = if (machine.safeFuel < 25) AgroRedAlert else AgroGreenPrimary,
                                modifier = Modifier.weight(1f)
                            )
                            VehicleGaugeWidget(
                                title = "Health",
                                valueText = "${machine.safeHealth}%",
                                percentValue = machine.safeHealth / 100f,
                                gaugeColor = AgroGreenVariant,
                                modifier = Modifier.weight(1f)
                            )
                            VehicleGaugeWidget(
                                title = "Temp",
                                valueText = "${machine.safeTemp}°C",
                                percentValue = machine.safeTemp / 120f,
                                gaugeColor = if (machine.safeTemp > 95) AgroRedAlert else AgroAmberAccent,
                                modifier = Modifier.weight(1f)
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Driver: ${machine.assignedDriverName ?: "Unassigned"}", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text("Speed: ${machine.safeSpeed} km/h", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }
        }
    }
}
