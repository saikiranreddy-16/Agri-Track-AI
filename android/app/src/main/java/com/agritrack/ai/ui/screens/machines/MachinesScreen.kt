package com.agritrack.ai.ui.screens.machines

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
import com.agritrack.ai.domain.model.Machine
import com.agritrack.ai.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MachinesScreen(
    machines: List<Machine> = emptyList(),
    onMachineClick: (String) -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedFilter by remember { mutableStateOf("All") }

    val filteredMachines = remember(searchQuery, selectedFilter, machines) {
        machines.filter { machine ->
            val matchesSearch = machine.safeName.contains(searchQuery, ignoreCase = true) ||
                    machine.safeModel.contains(searchQuery, ignoreCase = true)
            val matchesFilter = when (selectedFilter) {
                "Working" -> machine.safeStatus.equals("Working", ignoreCase = true) || machine.safeStatus.equals("Active", ignoreCase = true)
                "Offline" -> machine.safeStatus.equals("Offline", ignoreCase = true) || machine.safeStatus.equals("Idle", ignoreCase = true)
                else -> true
            }
            matchesSearch && matchesFilter
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Fleet Machines", fontWeight = FontWeight.Bold, fontSize = 20.sp)
                        Text("Commercial Farm Equipment Catalog", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp)
        ) {
            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search by name or model...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { searchQuery = "" }) {
                            Icon(Icons.Default.Clear, contentDescription = "Clear")
                        }
                    }
                },
                singleLine = true,
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp)
            )

            // Filter Chips Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf("All", "Working", "Offline").forEach { filter ->
                    FilterChip(
                        selected = selectedFilter == filter,
                        onClick = { selectedFilter = filter },
                        label = { Text(filter, fontSize = 12.sp) }
                    )
                }
            }

            if (filteredMachines.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.Agriculture, contentDescription = null, modifier = Modifier.size(48.dp), tint = AgroGreenPrimary)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("No machines found matching filter", style = MaterialTheme.typography.bodyMedium)
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(filteredMachines) { machine ->
                        Card(
                            onClick = { onMachineClick(machine.displayId) },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(machine.safeName, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                        Text(machine.safeModel, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                    Surface(
                                        shape = RoundedCornerShape(10.dp),
                                        color = if (machine.safeStatus == "Active" || machine.safeStatus == "Working") AgroGreenPrimary.copy(alpha = 0.15f) else AgroAmberAccent.copy(alpha = 0.15f)
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Icon(
                                                imageVector = if (machine.safeStatus == "Active" || machine.safeStatus == "Working") Icons.Default.CheckCircle else Icons.Default.Pause,
                                                contentDescription = null,
                                                modifier = Modifier.size(12.dp),
                                                tint = if (machine.safeStatus == "Active" || machine.safeStatus == "Working") AgroGreenPrimary else AgroAmberAccent
                                            )
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text(
                                                text = machine.safeStatus,
                                                fontSize = 11.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = if (machine.safeStatus == "Active" || machine.safeStatus == "Working") AgroGreenPrimary else AgroAmberAccent
                                            )
                                        }
                                    }
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text("Fuel: ${machine.safeFuel}%", fontSize = 12.sp, color = AgroGreenPrimary, fontWeight = FontWeight.Bold)
                                    Text("Temp: ${machine.safeTemp}°C", fontSize = 12.sp, color = AgroAmberAccent, fontWeight = FontWeight.Bold)
                                    Text("Hours: ${machine.hoursOperated} hrs", fontSize = 12.sp, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text("Speed: ${machine.safeSpeed} km/h", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    Text("Health: ${machine.safeHealth}%", fontSize = 12.sp, color = AgroGreenVariant, fontWeight = FontWeight.SemiBold)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
