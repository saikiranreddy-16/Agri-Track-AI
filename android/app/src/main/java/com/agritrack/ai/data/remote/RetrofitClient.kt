package com.agritrack.ai.data.remote

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    private const val BASE_URL = "https://agri-track-ai-backend.onrender.com/api/v1/"

    private var authToken: String? = null

    fun setAuthToken(token: String?) {
        authToken = token
    }

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val authInterceptor = { chain: okhttp3.Interceptor.Chain ->
        val request = chain.request().newBuilder()
        authToken?.let {
            request.addHeader("Authorization", "Bearer $it")
        }
        chain.proceed(request.build())
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .addInterceptor(authInterceptor)
        .build()

    val instance: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}
