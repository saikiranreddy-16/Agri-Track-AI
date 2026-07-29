package com.agritrack.ai

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.agritrack.ai.ui.screens.auth.LoginScreen
import com.agritrack.ai.ui.screens.dashboard.DashboardScreen
import com.agritrack.ai.ui.theme.AgroGreenPrimary

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                MainAppScaffold()
            }
        }
    }
}

sealed class BottomNavItem(val title: String, val icon: ImageVector) {
    object Dashboard : BottomNavItem("Dashboard", Icons.Default.Dashboard)
    object Fleet : BottomNavItem("Fleet Map", Icons.Default.Map)
    object Machines : BottomNavItem("Machines", Icons.Default.Agriculture)
    object Expenses : BottomNavItem("Expenses", Icons.Default.AccountBalanceWallet)
    object Assistant : BottomNavItem("AI Assist", Icons.Default.SmartToy)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppScaffold() {
    var authToken by remember { mutableStateOf<String?>(null) }
    var selectedItem by remember { mutableStateOf<BottomNavItem>(BottomNavItem.Dashboard) }

    if (authToken == null) {
        LoginScreen(
            onLoginSuccess = { token ->
                authToken = token
            }
        )
        return
    }

    val navItems = listOf(
        BottomNavItem.Dashboard,
        BottomNavItem.Fleet,
        BottomNavItem.Machines,
        BottomNavItem.Expenses,
        BottomNavItem.Assistant
    )

    Scaffold(
        bottomBar = {
            NavigationBar(containerColor = MaterialTheme.colorScheme.surface) {
                navItems.forEach { item ->
                    NavigationBarItem(
                        icon = { Icon(item.icon, contentDescription = item.title) },
                        label = { Text(item.title) },
                        selected = selectedItem == item,
                        onClick = { selectedItem = item },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = AgroGreenPrimary,
                            indicatorColor = AgroGreenPrimary.copy(alpha = 0.15f)
                        )
                    )
                }
            }
        }
    ) { paddingValues ->
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            color = MaterialTheme.colorScheme.background
        ) {
            when (selectedItem) {
                is BottomNavItem.Dashboard -> DashboardScreen(authToken = authToken!!)
                else -> {
                    Surface(modifier = Modifier.fillMaxSize()) {
                        Text(
                            text = "${selectedItem.title} Module Active",
                            modifier = Modifier.padding(16.dp),
                            style = MaterialTheme.typography.headlineMedium
                        )
                    }
                }
            }
        }
    }
}

