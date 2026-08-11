package com.agritrack.ai.ui.screens.dashboard

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

import androidx.lifecycle.viewmodel.compose.viewModel
import com.agritrack.ai.ui.viewmodel.DashboardState
import com.agritrack.ai.ui.viewmodel.DashboardViewModel

import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.*
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel = viewModel(),
    userRole: String? = null,
    onNavigateToMachine: (String) -> Unit = {},
    onLogout: () -> Unit = {},
) {
    val state = viewModel.state
    var showNotificationsSheet by remember { mutableStateOf(value = false) }
    var showVoiceSheet by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        viewModel.fetchDashboardData()
    }

    if (showNotificationsSheet) {
        AlertDialog(
            onDismissRequest = { showNotificationsSheet = false },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Notifications, contentDescription = null, tint = AgroGreenPrimary)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Live Fleet Alerts", fontWeight = FontWeight.Bold)
                }
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("• Mahindra Yuvo: Low Fuel Alert (15%)", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurface)
                    Text("• John Deere 5042D: Scheduled Service in 50 Hours", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurface)
                    Text("• System Notice: Telemetry sync active on port 5000", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            },
            confirmButton = {
                TextButton(onClick = { showNotificationsSheet = false }) {
                    Text("Close")
                }
            }
        )
    }

    if (showVoiceSheet) {
        AlertDialog(
            onDismissRequest = { showVoiceSheet = false },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Mic, contentDescription = null, tint = AgroAmberAccent)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("AI Voice Assistant", fontWeight = FontWeight.Bold)
                }
            },
            text = {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                    Icon(Icons.Default.GraphicEq, contentDescription = null, modifier = Modifier.size(48.dp), tint = AgroGreenPrimary)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Listening for farm queries...", fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                    Text("Try: 'What is my total fleet profit today?'", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            },
            confirmButton = {
                TextButton(onClick = { showVoiceSheet = false }) {
                    Text("Done")
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
                            text = if (userRole != null && (userRole != "Farm Admin")) "AgriTrack AI - Enterprise Admin" else "AgriTrack AI",
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp,
                            maxLines = 1
                        )
                        Text(
                            text = if (userRole != null && (userRole != "Farm Admin")) "Company Executive Fleet Portal" else "Commercial Farm Operations",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            maxLines = 1
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { showVoiceSheet = true }) {
                        Icon(Icons.Default.Mic, contentDescription = "Voice Assistant", tint = AgroAmberAccent)
                    }
                    IconButton(onClick = { showNotificationsSheet = true }) {
                        Icon(Icons.Default.Notifications, contentDescription = "Notifications")
                    }
                    IconButton(onClick = onLogout) {
                        Icon(Icons.AutoMirrored.Filled.ExitToApp, contentDescription = "Logout", tint = MaterialTheme.colorScheme.error)
                    }
                }
            )
        }
    ) { paddingValues ->
        when (state) {
            is DashboardState.Loading -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = AgroGreenPrimary)
                }
            }
            is DashboardState.Error -> {
                Box(modifier = Modifier.fillMaxSize().padding(16.dp), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(text = state.message, color = MaterialTheme.colorScheme.error)
                        Button(onClick = { viewModel.fetchDashboardData() }, modifier = Modifier.padding(top = 8.dp)) {
                            Text("Retry")
                        }
                    }
                }
            }
            is DashboardState.Success -> {
                val machinesList = state.machines
                val metrics = state.metrics
                
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
                                    text = "₹${String.format(Locale.getDefault(), "%,.0f", metrics.netProfitToday)}",
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
                                        Text("₹${String.format(Locale.getDefault(), "%,.0f", metrics.totalIncomeToday)}", color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
                                    }
                                    Column {
                                        Text("Expenses Today", color = Color.White.copy(alpha = 0.7f), fontSize = 11.sp)
                                        Text("₹${String.format(Locale.getDefault(), "%,.0f", metrics.totalExpenseToday)}", color = AgroAmberAccent, fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
                                    }
                                    Column {
                                        Text("Active Fleet", color = Color.White.copy(alpha = 0.7f), fontSize = 11.sp)
                                        Text("${metrics.activeMachines}/${metrics.totalFleet}", color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
                                    }
                                }
                            }
                        }
                    }

                    // Fleet Telemetry & Operating Hours Overview
                    item {
                        Card(
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
                                    Text("Fleet Operating Metrics", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                    Icon(Icons.Default.Speed, contentDescription = null, tint = AgroGreenPrimary)
                                }
                                Spacer(modifier = Modifier.height(12.dp))
                                val totalFleetHours = machinesList.sumOf { it.hoursOperated ?: 0.0 }
                                val avgSpeed = if (machinesList.isNotEmpty()) machinesList.map { it.safeSpeed }.average() else 0.0
                                val avgTemp = if (machinesList.isNotEmpty()) machinesList.map { it.safeTemp }.average() else 0.0

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column {
                                        Text("Total Operating Hours", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                        Text("${String.format(Locale.getDefault(), "%.1f", totalFleetHours)} hrs", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = AgroGreenPrimary)
                                    }
                                    Column {
                                        Text("Avg Fleet Speed", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                        Text("${String.format(Locale.getDefault(), "%.1f", avgSpeed)} km/h", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                    }
                                    Column {
                                        Text("Avg Engine Temp", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                        Text("${String.format(Locale.getDefault(), "%.1f", avgTemp)}°C", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = AgroAmberAccent)
                                    }
                                }
                            }
                        }
                    }

                    // Live Fleet Quick Status Summary (Replaces detailed machine gauge list)
                    item {
                        Card(
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
                                    Text("Fleet Status Summary", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                    Surface(
                                        shape = RoundedCornerShape(8.dp),
                                        color = AgroGreenPrimary.copy(alpha = 0.15f)
                                    ) {
                                        Text(
                                            text = "${machinesList.count { it.safeStatus == "Working" || it.safeStatus == "Active" }} Working / ${machinesList.count { it.safeStatus == "Offline" }} Offline",
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = AgroGreenPrimary,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                        )
                                    }
                                }
                                Spacer(modifier = Modifier.height(12.dp))
                                machinesList.take(3).forEach { machine ->
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(vertical = 4.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Icon(
                                                Icons.Default.Agriculture,
                                                contentDescription = null,
                                                modifier = Modifier.size(18.dp),
                                                tint = AgroGreenPrimary
                                            )
                                            Spacer(modifier = Modifier.width(8.dp))
                                            Column {
                                                Text(machine.safeName, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                                                Text("${machine.safeFuel}% Fuel • ${machine.hoursOperated} hrs", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                            }
                                        }
                                        Text(
                                            text = "${machine.safeTemp}°C",
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (machine.safeTemp > 90) AgroRedAlert else AgroAmberAccent
                                        )
                                    }
                                    HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp), color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
