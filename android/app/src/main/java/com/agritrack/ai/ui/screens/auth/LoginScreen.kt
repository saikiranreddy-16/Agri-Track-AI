package com.agritrack.ai.ui.screens.auth

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.agritrack.ai.data.remote.RetrofitClient
import com.agritrack.ai.domain.model.LoginRequest
import com.agritrack.ai.ui.theme.AgroAmberAccent
import com.agritrack.ai.ui.theme.AgroGreenPrimary
import kotlinx.coroutines.launch

import androidx.lifecycle.viewmodel.compose.viewModel
import com.agritrack.ai.ui.viewmodel.LoginState
import com.agritrack.ai.ui.viewmodel.LoginViewModel

enum class LoginTab {
    CUSTOMER, ADMIN
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    viewModel: LoginViewModel = viewModel(),
    onLoginSuccess: (String) -> Unit
) {
    var selectedTab by remember { mutableStateOf(LoginTab.CUSTOMER) }
    
    // Customer Fields
    var phone by remember { mutableStateOf("") }
    var pin by remember { mutableStateOf("") }
    
    // Admin Fields
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    val state = viewModel.state

    LaunchedEffect(state) {
        if (state is LoginState.Success) {
            onLoginSuccess(state.token)
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Header Title
                Text(
                    text = "AgriTrack AI",
                    fontWeight = FontWeight.Bold,
                    fontSize = 28.sp,
                    color = AgroGreenPrimary
                )
                Text(
                    text = "Smart Agriculture & Fleet Portal",
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Segmented Tab Selector for Customer vs Admin Login
                SingleChoiceSegmentedButtonRow(
                    modifier = Modifier.fillMaxWidth()
                ) {
                    SegmentedButton(
                        selected = selectedTab == LoginTab.CUSTOMER,
                        onClick = {
                            selectedTab = LoginTab.CUSTOMER
                            viewModel.resetError()
                        },
                        shape = SegmentedButtonDefaults.itemShape(index = 0, count = 2),
                        icon = { Icon(Icons.Default.Person, contentDescription = null) }
                    ) {
                        Text("Farm Customer", fontWeight = FontWeight.SemiBold)
                    }

                    SegmentedButton(
                        selected = selectedTab == LoginTab.ADMIN,
                        onClick = {
                            selectedTab = LoginTab.ADMIN
                            viewModel.resetError()
                        },
                        shape = SegmentedButtonDefaults.itemShape(index = 1, count = 2),
                        icon = { Icon(Icons.Default.AdminPanelSettings, contentDescription = null) }
                    ) {
                        Text("Company Admin", fontWeight = FontWeight.SemiBold)
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Form Input Fields
                if (selectedTab == LoginTab.CUSTOMER) {
                    OutlinedTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        label = { Text("Phone Number") },
                        placeholder = { Text("e.g. 9876543210") },
                        leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    OutlinedTextField(
                        value = pin,
                        onValueChange = { pin = it },
                        label = { Text("PIN / Password") },
                        placeholder = { Text("Enter PIN or Password") },
                        leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) },
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                } else {
                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text("Admin Email") },
                        placeholder = { Text("admin@agritrack.in") },
                        leadingIcon = { Icon(Icons.Default.Email, contentDescription = null) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        label = { Text("Password") },
                        placeholder = { Text("Enter Admin Password") },
                        leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) },
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                // Error Message Display
                AnimatedVisibility(visible = state is LoginState.Error) {
                    if (state is LoginState.Error) {
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = state.message,
                            color = MaterialTheme.colorScheme.error,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Submit Button
                Button(
                    onClick = {
                        val req = if (selectedTab == LoginTab.CUSTOMER) {
                            if (phone.isBlank() || pin.isBlank()) {
                                // Handled locally or in VM
                                return@Button
                            }
                            LoginRequest(phone = phone.trim(), password = pin.trim())
                        } else {
                            if (email.isBlank() || password.isBlank()) {
                                return@Button
                            }
                            LoginRequest(email = email.trim(), password = password.trim())
                        }
                        viewModel.login(req)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (selectedTab == LoginTab.CUSTOMER) AgroGreenPrimary else AgroAmberAccent
                    ),
                    enabled = state !is LoginState.Loading
                ) {
                    if (state is LoginState.Loading) {
                        CircularProgressIndicator(
                            color = Color.White,
                            modifier = Modifier.size(24.dp),
                            strokeWidth = 2.5.dp
                        )
                    } else {
                        Text(
                            text = if (selectedTab == LoginTab.CUSTOMER) "FARM CUSTOMER LOGIN" else "COMPANY ADMIN LOGIN",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = if (selectedTab == LoginTab.CUSTOMER) Color.White else Color.Black
                        )
                    }
                }
            }
        }
    }
}
