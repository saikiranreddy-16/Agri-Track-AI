package com.agritrack.ai.ui.screens.assistant

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

data class ChatMessage(
    val sender: String, // "AI" or "USER"
    val text: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AIAssistantScreen(
    userRole: String? = null,
    assignedMachineName: String = "John Deere 5042D"
) {
    val isCustomer = userRole != null && userRole != "Company Admin" && userRole != "Admin"
    var inputText by remember { mutableStateOf("") }
    val messages = remember {
        mutableStateListOf(
            ChatMessage("AI", "Hello! I am AgriTrack AI, your smart farm assistant. Ask me anything about your assigned tractor, fuel consumption, driver performance, or operating hours!"),
            ChatMessage("USER", "How is my $assignedMachineName fuel efficiency today?"),
            ChatMessage("AI", "Your $assignedMachineName is currently operating at optimal efficiency (78% fuel level, speed 19 km/h). Total operating hours: 142.5 hrs.")
        )
    }

    val analyzeUserQuery: (String) -> String = { query ->
        val lower = query.lowercase()

        // Check if Farm Customer is asking about a vehicle that does not belong to them
        val unauthorizedVehicle = when {
            (lower.contains("mahindra") || lower.contains("yuvo") || lower.contains("575")) && !assignedMachineName.lowercase().contains("mahindra") -> "Mahindra Yuvo Tech Plus 575"
            (lower.contains("preet") || lower.contains("combine") || lower.contains("harvester")) && !assignedMachineName.lowercase().contains("preet") -> "Preet 987 Combine Harvester"
            (lower.contains("swaraj") || lower.contains("855")) && !assignedMachineName.lowercase().contains("swaraj") -> "Swaraj 855 FE"
            else -> null
        }

        if (isCustomer && unauthorizedVehicle != null) {
            "⚠️ **Vehicle Access Boundary:**\nThe requested machine ($unauthorizedVehicle) is not registered under your Farm Customer account.\n\nAs a Farm Customer, your access is restricted to your assigned vehicle (**$assignedMachineName**). Please enter prompts relevant to your equipment."
        } else {
            when {
                lower.contains("john deere") || lower.contains("5042d") || lower.contains("johndeer") || (isCustomer && (lower.contains("my") || lower.contains("tractor") || lower.contains("hour") || lower.contains("work") || lower.contains("yesterday"))) -> {
                    if (lower.contains("hour") || lower.contains("work") || lower.contains("yesterday") || lower.contains("time")) {
                        "📊 **$assignedMachineName Telemetry Report:**\n• Total Operating Hours: **142.5 hrs** (Log: 6.5 hrs worked yesterday)\n• Current Status: **Working**\n• Engine Temp: **85°C** | Fuel: **78%** | Speed: **19 km/h**\n• Net Income Today: **₹12,500**"
                    } else if (lower.contains("fuel")) {
                        "⛽ **$assignedMachineName Fuel Status:**\n• Current Fuel: **78%**\n• Avg Consumption: 4.2 L/hr\n• Diesel Refill Today: 200L logged (₹18,500)."
                    } else {
                        "🚜 **$assignedMachineName Specs & Status:**\n• Model: 5042D Utility Tractor\n• Total Hours: **142.5 hrs**\n• Health Score: **100%** | Engine Temp: **85°C**\n• Location: Guntur Field Sector 4."
                    }
                }
                lower.contains("mahindra") || lower.contains("yuvo") || lower.contains("575") -> {
                    "🚜 **Mahindra Yuvo Tech Plus 575:**\n• Total Operating Hours: **98.0 hrs** (Log: 4.0 hrs worked yesterday)\n• Status: **Offline** (Scheduled Service completed yesterday)\n• Fuel: **100%** | Engine Temp: **85°C**\n• Health Score: **95%**"
                }
                lower.contains("preet") || lower.contains("combine") || lower.contains("harvester") -> {
                    "🌾 **Preet 987 Combine Harvester:**\n• Total Operating Hours: **210.0 hrs** (Log: 8.0 hrs worked yesterday)\n• Status: **Working**\n• Speed: **12.5 km/h** | Fuel: **77%** | Engine Temp: **85°C**\n• Net Income Today: **₹18,000**"
                }
                lower.contains("swaraj") || lower.contains("855") -> {
                    "🚜 **Swaraj 855 FE:**\n• Total Operating Hours: **180.0 hrs** (Log: 5.5 hrs worked yesterday)\n• Status: **Working**\n• Fuel: **64%** | Engine Temp: **88°C** | Speed: **16.0 km/h**\n• Hydraulic hose replacement completed on 08 Aug."
                }
                lower.contains("total hour") || lower.contains("hours") || lower.contains("operating") -> {
                    if (isCustomer) {
                        "⏱️ **Your Equipment Operating Hours:**\n• Assigned Vehicle: **$assignedMachineName**\n• Total Operating Hours: **142.5 hours** (6.5 hrs logged yesterday)."
                    } else {
                        "⏱️ **Fleet Operating Hours Aggregate:**\n• Total Operating Hours across all 4 vehicles: **630.5 hours**\n• John Deere 5042D: 142.5 hrs\n• Preet Combine: 210.0 hrs\n• Swaraj 855 FE: 180.0 hrs\n• Mahindra Yuvo: 98.0 hrs"
                    }
                }
                lower.contains("profit") || lower.contains("income") || lower.contains("expense") || lower.contains("expenditure") -> {
                    "💰 **Financial Overview:**\n• Logged Vehicle Expenditures: **₹18,500** (Diesel Refill 200L)\n• Daily Income Generated: **₹12,500**"
                }
                else -> {
                    "🤖 **AgriTrack AI Telemetry Intelligence:**\nAnalyzed query '$query' for **$assignedMachineName**. Vehicle status: **Working** in Guntur Field Sector 4 with **142.5 operating hours** logged."
                }
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("AgriTrack AI Assistant", fontWeight = FontWeight.Bold, fontSize = 20.sp)
                        Text("Smart Farm Telemetry & Operational Insights", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                },
                actions = {
                    IconButton(onClick = {}) {
                        Icon(Icons.Default.Mic, contentDescription = "Voice Input", tint = AgroAmberAccent)
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
        ) {
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(messages) { msg ->
                    val isAi = msg.sender == "AI"
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = if (isAi) Arrangement.Start else Arrangement.End
                    ) {
                        Surface(
                            shape = RoundedCornerShape(16.dp),
                            color = if (isAi) MaterialTheme.colorScheme.surfaceVariant else AgroGreenPrimary,
                            modifier = Modifier.widthIn(max = 290.dp)
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(
                                    text = if (isAi) "AgriTrack AI" else "You",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isAi) AgroGreenPrimary else Color.White.copy(alpha = 0.8f)
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = msg.text,
                                    fontSize = 14.sp,
                                    color = if (isAi) MaterialTheme.colorScheme.onSurfaceVariant else Color.White
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Input Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = inputText,
                    onValueChange = { inputText = it },
                    placeholder = { Text("Ask AgriTrack AI...") },
                    singleLine = true,
                    shape = RoundedCornerShape(24.dp),
                    modifier = Modifier.weight(1f)
                )
                Spacer(modifier = Modifier.width(8.dp))
                IconButton(
                    onClick = {
                        if (inputText.isNotBlank()) {
                            val userQuery = inputText.trim()
                            messages.add(ChatMessage("USER", userQuery))
                            inputText = ""
                            messages.add(ChatMessage("AI", analyzeUserQuery(userQuery)))
                        }
                    },
                    modifier = Modifier.size(48.dp)
                ) {
                    Icon(Icons.Default.Send, contentDescription = "Send", tint = AgroGreenPrimary)
                }
            }
        }
    }
}
