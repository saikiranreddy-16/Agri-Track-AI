package com.agritrack.ai

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
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

import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController

import com.agritrack.ai.ui.theme.AgriTrackTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AgriTrackTheme {
                MainAppNavHost()
            }
        }
    }
}

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Dashboard : Screen("dashboard")
    object Fleet : Screen("fleet")
    object Machines : Screen("machines")
    object Expenses : Screen("expenses")
    object Assistant : Screen("assistant")
}

sealed class BottomNavItem(val title: String, val icon: ImageVector, val route: String) {
    object Dashboard : BottomNavItem("Dashboard", Icons.Default.Dashboard, Screen.Dashboard.route)
    object Fleet : BottomNavItem("Fleet Map", Icons.Default.Map, Screen.Fleet.route)
    object Machines : BottomNavItem("Machines", Icons.Default.Agriculture, Screen.Machines.route)
    object Expenses : BottomNavItem("Expenses", Icons.Default.AccountBalanceWallet, Screen.Expenses.route)
    object Assistant : BottomNavItem("AI Assist", Icons.Default.SmartToy, Screen.Assistant.route)
}

@Composable
fun MainAppNavHost() {
    val navController = rememberNavController()
    var authToken by remember { mutableStateOf<String?>(null) }

    NavHost(
        navController = navController,
        startDestination = Screen.Login.route
    ) {
        composable(Screen.Login.route) {
            LoginScreen(
                onLoginSuccess = { token ->
                    authToken = token
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }
        composable(Screen.Dashboard.route) {
            MainAppScaffold(navController, authToken) {
                DashboardScreen(authToken = authToken ?: "")
            }
        }
        composable(Screen.Fleet.route) {
            MainAppScaffold(navController, authToken) {
                PlaceholderScreen("Fleet Map")
            }
        }
        composable(Screen.Machines.route) {
            MainAppScaffold(navController, authToken) {
                PlaceholderScreen("Machines")
            }
        }
        composable(Screen.Expenses.route) {
            MainAppScaffold(navController, authToken) {
                PlaceholderScreen("Expenses")
            }
        }
        composable(Screen.Assistant.route) {
            MainAppScaffold(navController, authToken) {
                PlaceholderScreen("AI Assistant")
            }
        }
    }
}

@Composable
fun PlaceholderScreen(title: String) {
    Surface(modifier = Modifier.fillMaxSize()) {
        Text(
            text = "$title Module Active",
            modifier = Modifier.padding(16.dp),
            style = MaterialTheme.typography.headlineMedium
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppScaffold(
    navController: NavController,
    authToken: String?,
    content: @Composable () -> Unit
) {
    val navItems = listOf(
        BottomNavItem.Dashboard,
        BottomNavItem.Fleet,
        BottomNavItem.Machines,
        BottomNavItem.Expenses,
        BottomNavItem.Assistant
    )

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    Scaffold(
        bottomBar = {
            NavigationBar(containerColor = MaterialTheme.colorScheme.surface) {
                navItems.forEach { item ->
                    NavigationBarItem(
                        icon = { Icon(item.icon, contentDescription = item.title) },
                        label = { Text(item.title) },
                        selected = currentRoute == item.route,
                        onClick = {
                            if (currentRoute != item.route) {
                                navController.navigate(item.route) {
                                    popUpTo(Screen.Dashboard.route) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = AgroGreenPrimary,
                            indicatorColor = AgroGreenPrimary.copy(alpha = 0.15f)
                        )
                    )
                }
            }
        }
    ) { paddingValues ->
        Box(modifier = Modifier.padding(paddingValues)) {
            content()
        }
    }
}

