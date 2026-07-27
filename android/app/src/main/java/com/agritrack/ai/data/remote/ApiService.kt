package com.agritrack.ai.data.remote

import retrofit2.Response
import retrofit2.http.GET

interface ApiService {
    @GET("health")
    suspend fun checkHealth(): Response<Map<String, Any>>
}
