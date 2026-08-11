package com.agritrack.ai.ui.screens.machines

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import com.agritrack.ai.domain.model.Machine
import com.agritrack.ai.ui.components.VehicleGaugeWidget
import com.agritrack.ai.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MachineDetailScreen(
    machine: Machine?,
    onBackClick: () -> Unit,
    onStartTelemetry: () -> Unit = {}
) {
    val m = machine ?: Machine(name = "John Deere 5042D", model = "5042D", brand = "John Deere", status = "Working")

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = m.safeName,
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp,
                            maxLines = 1
                        )
                        Text(
                            text = "Model: ${m.safeModel} • Telemetry Active",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = onStartTelemetry) {
                        Icon(Icons.Default.GpsFixed, contentDescription = "Live GPS", tint = AgroAmberAccent)
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            // Machine Status Header Banner
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
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
                        Text(m.safeName, fontWeight = FontWeight.Bold, fontSize = 20.sp)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Category: ${m.type ?: "Tractor"}", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text("Driver: ${m.assignedDriverName ?: "Unassigned"}", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                    }
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = if (m.safeStatus == "Active" || m.safeStatus == "Working") AgroGreenPrimary.copy(alpha = 0.15f) else AgroAmberAccent.copy(alpha = 0.15f)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = if (m.safeStatus == "Active" || m.safeStatus == "Working") Icons.Default.CheckCircle else Icons.Default.Pause,
                                contentDescription = null,
                                modifier = Modifier.size(14.dp),
                                tint = if (m.safeStatus == "Active" || m.safeStatus == "Working") AgroGreenPrimary else AgroAmberAccent
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = m.safeStatus,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (m.safeStatus == "Active" || m.safeStatus == "Working") AgroGreenPrimary else AgroAmberAccent
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Vital Gauges Card
            Text("Real-Time Vehicle Health Gauges", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            Spacer(modifier = Modifier.height(8.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    VehicleGaugeWidget(
                        title = "Fuel",
                        valueText = "${m.safeFuel}%",
                        percentValue = m.safeFuel / 100f,
                        gaugeColor = if (m.safeFuel < 25) AgroRedAlert else AgroGreenPrimary,
                        modifier = Modifier.weight(1f)
                    )
                    VehicleGaugeWidget(
                        title = "Health",
                        valueText = "${m.safeHealth}%",
                        percentValue = m.safeHealth / 100f,
                        gaugeColor = AgroGreenVariant,
                        modifier = Modifier.weight(1f)
                    )
                    VehicleGaugeWidget(
                        title = "Temp",
                        valueText = "${m.safeTemp}°C",
                        percentValue = m.safeTemp / 120f,
                        gaugeColor = if (m.safeTemp > 95) AgroRedAlert else AgroAmberAccent,
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Technical Specs Grid
            Text("Telemetry & Service Details", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            Spacer(modifier = Modifier.height(8.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    SpecRow(icon = Icons.Default.Speed, label = "Current Speed", value = "${m.safeSpeed} km/h")
                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                    SpecRow(icon = Icons.Default.BatteryFull, label = "Battery Voltage", value = "${m.batteryVoltage ?: 13.5} V")
                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                    SpecRow(icon = Icons.Default.Schedule, label = "Operating Hours", value = "${m.hoursOperated ?: 100.0} hrs")
                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                    SpecRow(icon = Icons.Default.Build, label = "Next Service Due", value = "In ${m.nextServiceHours ?: 50} hrs")
                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                    SpecRow(icon = Icons.Default.Place, label = "GPS Coordinates", value = "${m.safeLat}, ${m.safeLng}")
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Daily Financials Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = AgroGreenPrimary)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Today's Machine Revenue", color = Color.White.copy(alpha = 0.8f), fontSize = 12.sp)
                        Text("₹${String.format("%,.0f", m.safeIncome)}", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 20.sp)
                    }
                    Column(horizontalAlignment = Alignment.End) {
                        Text("Today's Expense", color = Color.White.copy(alpha = 0.8f), fontSize = 12.sp)
                        Text("₹${String.format("%,.0f", m.safeExpense)}", color = AgroAmberAccent, fontWeight = FontWeight.Bold, fontSize = 20.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Action Buttons
            Button(
                onClick = onStartTelemetry,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AgroGreenPrimary)
            ) {
                Icon(Icons.Default.MyLocation, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Start Live GPS Tracking", fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun SpecRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    value: String
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, contentDescription = null, tint = AgroGreenPrimary, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(10.dp))
            Text(label, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        Text(value, fontSize = 13.sp, fontWeight = FontWeight.Bold)
    }
}
