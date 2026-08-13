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
import androidx.lifecycle.viewmodel.compose.viewModel
import com.agritrack.ai.ui.theme.*
import com.agritrack.ai.ui.viewmodel.AIAssistantViewModel

data class ChatMessage(
    val sender: String, // "AI" or "USER"
    val text: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AIAssistantScreen(
    userRole: String? = null,
    assignedMachineName: String = "John Deere 5042D",
    aiViewModel: AIAssistantViewModel = viewModel()
) {
    var inputText by remember { mutableStateOf("") }
    val messages = aiViewModel.messages

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

            if (aiViewModel.isSending) {
                LinearProgressIndicator(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    color = AgroGreenPrimary
                )
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
                        if (inputText.isNotBlank() && !aiViewModel.isSending) {
                            val userQuery = inputText.trim()
                            inputText = ""
                            aiViewModel.sendMessage(userQuery, assignedMachineName)
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

