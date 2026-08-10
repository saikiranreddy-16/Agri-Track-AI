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
    data class Success(val token: String) : LoginState()
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
                
                if (response.isSuccessful && token != null) {
                    RetrofitClient.setAuthToken(token)
                    state = LoginState.Success(token)
                } else {
                    state = LoginState.Error(body?.message ?: "Login failed")
                }
            } catch (e: Exception) {
                state = LoginState.Error(e.localizedMessage ?: "Network error")
            }
        }
    }
    
    fun resetError() {
        if (state is LoginState.Error) {
            state = LoginState.Idle
        }
    }
}
