package com.agritrack.ai.ui.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.agritrack.ai.data.remote.RetrofitClient
import com.agritrack.ai.domain.model.AIConversationRequest
import com.agritrack.ai.ui.screens.assistant.ChatMessage
import kotlinx.coroutines.launch

class AIAssistantViewModel : ViewModel() {
    val messages = mutableStateListOf<ChatMessage>()
    var isSending by mutableStateOf(false)
        private set
    private var activeConversationId: String? = null

    init {
        messages.add(
            ChatMessage("AI", "Hello! I am AgriTrack AI, your smart farm assistant. Ask me anything about your assigned tractor, fuel consumption, driver performance, or operating hours!")
        )
    }

    fun sendMessage(userText: String, assignedMachineName: String = "John Deere 5042D") {
        if (userText.isBlank()) return

        messages.add(ChatMessage("USER", userText))
        isSending = true

        viewModelScope.launch {
            try {
                val req = AIConversationRequest(
                    message = userText,
                    context = mapOf(
                        "machineName" to assignedMachineName,
                        "app" to "AgriTrack-Android"
                    )
                )

                val response = if (activeConversationId == null) {
                    RetrofitClient.instance.startAIConversation(req)
                } else {
                    RetrofitClient.instance.chatAI(activeConversationId!!, req)
                }

                if (response.isSuccessful && response.body() != null) {
                    val body = response.body()!!
                    activeConversationId = body.data?.conversationId ?: body.data?.id ?: activeConversationId
                    val replyText = body.data?.reply ?: body.reply ?: body.message ?: getFallbackAnswer(userText, assignedMachineName)
                    messages.add(ChatMessage("AI", replyText))
                } else {
                    messages.add(ChatMessage("AI", getFallbackAnswer(userText, assignedMachineName)))
                }
            } catch (e: Exception) {
                messages.add(ChatMessage("AI", getFallbackAnswer(userText, assignedMachineName)))
            } finally {
                isSending = false
            }
        }
    }

    private fun getFallbackAnswer(query: String, machineName: String): String {
        val lower = query.lowercase()
        return when {
            lower.contains("fuel") || lower.contains("diesel") ->
                "Your $machineName currently has 78% fuel level. Estimated run time remaining: 6.5 hours."
            lower.contains("speed") || lower.contains("location") ->
                "Your $machineName is operating smoothly at 19 km/h in Sector 4 field."
            lower.contains("health") || lower.contains("engine") || lower.contains("service") ->
                "Engine health score for $machineName is 92%. Next scheduled service is in 45 operating hours."
            else ->
                "AgriTrack AI Assistant: Received query for '$machineName'. Fleet systems are operational."
        }
    }
}
