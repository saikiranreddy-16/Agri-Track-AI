package com.agritrack.ai.data.remote

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    // Local Computer Backend Server IP (Port 5000)
    // Physical Device: http://172.17.13.21:5000/api/v1/
    // Android Emulator: http://10.0.2.2:5000/api/v1/
    // Production Cloud: https://agri-track-ai-backend.onrender.com/api/v1/
    private const val BASE_URL = "https://agri-track-ai-backend.onrender.com/"

    val instance: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}
