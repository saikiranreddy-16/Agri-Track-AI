package com.agritrack.ai.data.remote

import com.agritrack.ai.domain.model.AddDieselExpenseRequest
import com.agritrack.ai.domain.model.AddMaintenanceRequest
import com.agritrack.ai.domain.model.AIConversationRequest
import com.agritrack.ai.domain.model.AIResponse
import com.agritrack.ai.domain.model.AlertRecord
import com.agritrack.ai.domain.model.ApiResponse
import com.agritrack.ai.domain.model.Driver
import com.agritrack.ai.domain.model.Expense
import com.agritrack.ai.domain.model.LoginRequest
import com.agritrack.ai.domain.model.LoginResponse
import com.agritrack.ai.domain.model.Machine
import com.agritrack.ai.domain.model.MaintenanceRecord
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface ApiService {
    @GET("health")
    suspend fun checkHealth(): Response<Map<String, Any>>

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @GET("machines")
    suspend fun getMachines(): Response<ApiResponse<List<Machine>>>

    @GET("expenses/diesel")
    suspend fun getExpenses(): Response<ApiResponse<List<Expense>>>

    @POST("expenses/diesel")
    suspend fun addDieselExpense(@Body request: AddDieselExpenseRequest): Response<ApiResponse<Expense>>

    @GET("drivers")
    suspend fun getDrivers(): Response<ApiResponse<List<Driver>>>

    @GET("maintenance")
    suspend fun getMaintenance(): Response<ApiResponse<List<MaintenanceRecord>>>

    @POST("maintenance")
    suspend fun addMaintenance(@Body request: AddMaintenanceRequest): Response<ApiResponse<MaintenanceRecord>>

    @GET("alerts")
    suspend fun getAlerts(): Response<ApiResponse<List<AlertRecord>>>

    @POST("ai/conversation")
    suspend fun startAIConversation(@Body request: AIConversationRequest): Response<AIResponse>

    @POST("ai/conversation/{id}/chat")
    suspend fun chatAI(
        @Path("id") conversationId: String,
        @Body request: AIConversationRequest
    ): Response<AIResponse>
}



