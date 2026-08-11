package com.agritrack.ai.ui.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.agritrack.ai.data.remote.RetrofitClient
import com.agritrack.ai.domain.model.LoginRequest
import kotlinx.coroutines.launch

sealed class LoginState {
    object Idle : LoginState()
    object Loading : LoginState()
    data class Success(val token: String, val role: String? = null) : LoginState()
    data class Error(val message: String) : LoginState()
}

class LoginViewModel : ViewModel() {
    var state by mutableStateOf<LoginState>(LoginState.Idle)
        private set

    fun login(request: LoginRequest) {
        state = LoginState.Loading
        viewModelScope.launch {
            try {
                val response = RetrofitClient.instance.login(request)
                val body = response.body()
                val token = body?.token ?: body?.data?.token
                val userRole = body?.data?.user?.role
                
                state = if (response.isSuccessful && (token != null)) {
                    RetrofitClient.setAuthToken(token)
                    LoginState.Success(token, userRole)
                } else {
                    val errorMsg = try {
                        val rawError = response.errorBody()?.string()
                        if (!rawError.isNullOrBlank()) {
                            val json = com.google.gson.JsonParser.parseString(rawError).asJsonObject
                            json["message"]?.asString
                                ?: json["error"]?.asString
                                ?: "Invalid credentials (${response.code()})"
                        } else {
                            "Invalid credentials (${response.code()})"
                        }
                    } catch (e: Exception) {
                        "Login failed (${response.code()})"
                    }
                    LoginState.Error(errorMsg)
                }
            } catch (e: java.net.ConnectException) {
                state = LoginState.Error("Cannot connect to server. Check IP in RetrofitClient (${e.localizedMessage})")
            } catch (e: java.net.SocketTimeoutException) {
                state = LoginState.Error("Connection timed out. Ensure PC and phone are on same Wi-Fi.")
            } catch (e: Exception) {
                state = LoginState.Error(e.localizedMessage ?: "Network error occurred")
            }
        }
    }
    
    fun resetError() {
        if (state is LoginState.Error) {
            state = LoginState.Idle
        }
    }
}
