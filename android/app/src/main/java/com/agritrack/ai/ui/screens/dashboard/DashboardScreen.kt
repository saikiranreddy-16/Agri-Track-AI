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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onNavigateToMachine: (String) -> Unit = {},
    onVoiceAssistClick: () -> Unit = {}
) {
    // Mock Telemetry & Fleet Summary Data for Demonstration
    val metrics = SummaryMetrics(
        totalFleet = 12,
        activeMachines = 8,
        idleMachines = 3,
        maintenanceMachines = 1,
        totalIncomeToday = 45000.0,
        totalExpenseToday = 12800.0,
        netProfitToday = 32200.0
    )

    val sampleMachines = listOf(
        Machine(
            id = "m1",
            name = "John Deere 5042D",
            model = "2024 Heavy Tractor",
            type = "Tractor",
            status = "Active",
            fuelLevelPercent = 82,
            engineTemperatureC = 88,
            batteryVoltage = 13.8,
            healthScorePercent = 94,
            speedKmh = 24.5,
            hoursOperated = 1240.5,
            nextServiceHours = 60,
            assignedDriverName = "Ramesh Kumar",
            dailyIncome = 15000.0,
            dailyExpense = 4200.0,
            lat = 16.5062,
            lng = 80.6480
        ),
        Machine(
            id = "m2",
            name = "Mahindra Arjun 605",
            model = "Harvester Special",
            type = "Harvester",
            status = "Idle",
            fuelLevelPercent = 35,
            engineTemperatureC = 72,
            batteryVoltage = 12.4,
            healthScorePercent = 86,
            speedKmh = 0.0,
            hoursOperated = 890.0,
            nextServiceHours = 15,
            assignedDriverName = "Suresh Reddy",
            dailyIncome = 18000.0,
            dailyExpense = 6100.0,
            lat = 16.5120,
            lng = 80.6550
        )
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
            items(sampleMachines) { machine ->
                Card(
                    onClick = { onNavigateToMachine(machine.id) },
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
                                Text(machine.name, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                Text(machine.model, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            AssistChip(
                                onClick = {},
                                label = { Text(machine.status, fontSize = 11.sp) },
                                leadingIcon = {
                                    Icon(
                                        imageVector = if (machine.status == "Active") Icons.Default.CheckCircle else Icons.Default.Pause,
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
                                valueText = "${machine.fuelLevelPercent}%",
                                percentValue = machine.fuelLevelPercent / 100f,
                                gaugeColor = if (machine.fuelLevelPercent < 25) AgroRedAlert else AgroGreenPrimary,
                                modifier = Modifier.weight(1f)
                            )
                            VehicleGaugeWidget(
                                title = "Health",
                                valueText = "${machine.healthScorePercent}%",
                                percentValue = machine.healthScorePercent / 100f,
                                gaugeColor = AgroGreenVariant,
                                modifier = Modifier.weight(1f)
                            )
                            VehicleGaugeWidget(
                                title = "Temp",
                                valueText = "${machine.engineTemperatureC}°C",
                                percentValue = machine.engineTemperatureC / 120f,
                                gaugeColor = if (machine.engineTemperatureC > 95) AgroRedAlert else AgroAmberAccent,
                                modifier = Modifier.weight(1f)
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Driver: ${machine.assignedDriverName ?: "Unassigned"}", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text("Speed: ${machine.speedKmh} km/h", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }
        }
    }
}
