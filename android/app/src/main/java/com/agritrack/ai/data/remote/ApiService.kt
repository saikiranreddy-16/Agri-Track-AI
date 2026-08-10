package com.agritrack.ai.data.remote

import com.agritrack.ai.domain.model.ApiResponse
import com.agritrack.ai.domain.model.Driver
import com.agritrack.ai.domain.model.Expense
import com.agritrack.ai.domain.model.LoginRequest
import com.agritrack.ai.domain.model.LoginResponse
import com.agritrack.ai.domain.model.Machine
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface ApiService {
    @GET("health")
    suspend fun checkHealth(): Response<Map<String, Any>>

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @GET("machines")
    suspend fun getMachines(): Response<ApiResponse<List<Machine>>>

    @GET("expenses")
    suspend fun getExpenses(): Response<ApiResponse<List<Expense>>>

    @GET("drivers")
    suspend fun getDrivers(): Response<ApiResponse<List<Driver>>>
}


