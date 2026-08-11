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
import androidx.compose.ui.unit.sp
import com.agritrack.ai.data.remote.RetrofitClient
import com.agritrack.ai.ui.screens.auth.LoginScreen
import com.agritrack.ai.ui.screens.dashboard.DashboardScreen
import com.agritrack.ai.ui.theme.AgroGreenPrimary
import com.agritrack.ai.ui.theme.AgroAmberAccent
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.width

import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController

import com.agritrack.ai.ui.theme.AgriTrackTheme

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.ui.Alignment
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.ContextCompat
import com.agritrack.ai.service.LocationForegroundService

import androidx.compose.ui.text.style.TextOverflow
import com.agritrack.ai.domain.model.Machine
import com.agritrack.ai.ui.screens.assistant.AIAssistantScreen
import com.agritrack.ai.ui.screens.expenses.ExpensesScreen
import com.agritrack.ai.ui.screens.machines.MachineDetailScreen
import com.agritrack.ai.ui.screens.machines.MachinesScreen

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
    object MachineDetail : Screen("machine_detail")
}

sealed class BottomNavItem(val title: String, val icon: ImageVector, val route: String) {
    object Dashboard : BottomNavItem("Dashboard", Icons.Default.Dashboard, Screen.Dashboard.route)
    object Fleet : BottomNavItem("Fleet Map", Icons.Default.Map, Screen.Fleet.route)
    object Machines : BottomNavItem("Machines", Icons.Default.Agriculture, Screen.Machines.route)
    object Expenses : BottomNavItem("Expenses", Icons.Default.AccountBalanceWallet, Screen.Expenses.route)
    object Assistant : BottomNavItem("AI Assist", Icons.Default.SmartToy, Screen.Assistant.route)
}

val sampleMachinesList = listOf(
    Machine(mongoId = "m1", id = "m1", name = "John Deere 5042D", model = "5042D", brand = "John Deere", type = "Tractor", status = "Working", fuelLevelPercent = 78, healthScorePercent = 100, engineTemperatureC = 85, speedKmh = 19.0, hoursOperated = 142.5, dailyIncome = 12500.0, dailyExpense = 2100.0),
    Machine(mongoId = "m2", id = "m2", name = "Mahindra Yuvo Tech Plus 575", model = "Yuvo Tech Plus 575", brand = "Mahindra", type = "Tractor", status = "Offline", fuelLevelPercent = 100, healthScorePercent = 95, engineTemperatureC = 85, speedKmh = 0.0, hoursOperated = 98.0, dailyIncome = 8000.0, dailyExpense = 1500.0),
    Machine(mongoId = "m3", id = "m3", name = "Preet 987 Combine Harvester", model = "987 Combine Harvester", brand = "Preet", type = "Harvester", status = "Working", fuelLevelPercent = 77, healthScorePercent = 100, engineTemperatureC = 85, speedKmh = 12.5, hoursOperated = 210.0, dailyIncome = 18000.0, dailyExpense = 4500.0),
    Machine(mongoId = "m4", id = "m4", name = "Swaraj 855 FE", model = "855 FE", brand = "Swaraj", type = "Tractor", status = "Working", fuelLevelPercent = 64, healthScorePercent = 92, engineTemperatureC = 88, speedKmh = 16.0, hoursOperated = 180.0, dailyIncome = 11000.0, dailyExpense = 1900.0),
)

@Composable
fun MainAppNavHost() {
    val navController = rememberNavController()
    var authToken by remember { mutableStateOf<String?>(null) }
    var userRole by remember { mutableStateOf<String?>(null) }

    val isCustomer = userRole != null && userRole != "Company Admin" && userRole != "Admin"
    val visibleMachines = if (isCustomer) {
        sampleMachinesList.filter { it.safeName.contains("John Deere", ignoreCase = true) }
    } else {
        sampleMachinesList
    }

    NavHost(
        navController = navController,
        startDestination = Screen.Login.route
    ) {
        composable(Screen.Login.route) {
            LoginScreen(
                onLoginSuccess = { token, role ->
                    authToken = token
                    userRole = role
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }
        composable(Screen.Dashboard.route) {
            val handleLogout: () -> Unit = {
                authToken = null
                userRole = null
                RetrofitClient.setAuthToken(null)
                navController.navigate(Screen.Login.route) {
                    popUpTo(0) { inclusive = true }
                }
            }
            MainAppScaffold(navController) {
                DashboardScreen(
                    userRole = userRole,
                    onNavigateToMachine = { id ->
                        navController.navigate("${Screen.MachineDetail.route}/$id")
                    },
                    onLogout = handleLogout
                )
            }
        }
        composable(Screen.Fleet.route) {
            MainAppScaffold(navController) {
                FleetMapScreen(machines = visibleMachines)
            }
        }
        composable(Screen.Machines.route) {
            MainAppScaffold(navController) {
                MachinesScreen(
                    machines = visibleMachines,
                    onMachineClick = { id ->
                        navController.navigate("${Screen.MachineDetail.route}/$id")
                    }
                )
            }
        }
        composable(Screen.Expenses.route) {
            MainAppScaffold(navController) {
                ExpensesScreen(
                    userRole = userRole,
                    machines = visibleMachines
                )
            }
        }
        composable(Screen.Assistant.route) {
            MainAppScaffold(navController) {
                AIAssistantScreen(
                    userRole = userRole,
                    assignedMachineName = if (visibleMachines.isNotEmpty()) visibleMachines.first().safeName else "John Deere 5042D"
                )
            }
        }
        composable("${Screen.MachineDetail.route}/{machineId}") { backStackEntry ->
            val machineId = backStackEntry.arguments?.getString("machineId")
            val selectedMachine = visibleMachines.find { it.displayId == machineId } ?: sampleMachinesList.find { it.displayId == machineId }
            MainAppScaffold(navController) {
                MachineDetailScreen(
                    machine = selectedMachine,
                    onBackClick = { navController.popBackStack() },
                    onStartTelemetry = { navController.navigate(Screen.Fleet.route) }
                )
            }
        }
    }
}

@Composable
fun FleetMapScreen(machines: List<Machine> = sampleMachinesList) {
    val context = LocalContext.current
    var isTrackingActive by remember { mutableStateOf(value = false) }
    var statusMessage by remember { mutableStateOf("Location tracking is currently inactive.") }

    val requiredPermissions = remember {
        mutableListOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        ).apply {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                add(Manifest.permission.POST_NOTIFICATIONS)
            }
        }.toTypedArray()
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val fineGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] ?: false
        val coarseGranted = permissions[Manifest.permission.ACCESS_COARSE_LOCATION] ?: false
        val notificationGranted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions[Manifest.permission.POST_NOTIFICATIONS] ?: false
        } else true

        if ((fineGranted || coarseGranted) && notificationGranted) {
            try {
                val serviceIntent = Intent(context, LocationForegroundService::class.java)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }
                isTrackingActive = true
                statusMessage = "Live GPS telemetry service is running."
            } catch (e: Exception) {
                statusMessage = "Failed to start service: ${e.localizedMessage}"
            }
        } else {
            isTrackingActive = false
            statusMessage = "Location & notification permissions are required for fleet tracking."
        }
    }

    Surface(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Fleet GPS Tracking",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Real-time Vehicle Satellite Telemetry",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Icon(
                    imageVector = Icons.Default.LocationOn,
                    contentDescription = "GPS",
                    modifier = Modifier.size(32.dp),
                    tint = AgroGreenPrimary
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Live Telemetry GPS Data Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.CellTower, contentDescription = null, tint = AgroGreenPrimary, modifier = Modifier.size(20.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Live Telemetry Stream", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        }
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = if (isTrackingActive) AgroGreenPrimary.copy(alpha = 0.15f) else MaterialTheme.colorScheme.errorContainer
                        ) {
                            Text(
                                text = if (isTrackingActive) "ONLINE • 12 SATS" else "STANDBY",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isTrackingActive) AgroGreenPrimary else MaterialTheme.colorScheme.error,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Column {
                            Text("Latitude", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text("16.3067° N", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        }
                        Column {
                            Text("Longitude", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text("80.4365° E", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        }
                        Column {
                            Text("Accuracy", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text("±2.1 meters", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = AgroGreenPrimary)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Active Vehicle Map Cards List
            Text(
                text = "Tracked Fleet Vehicles",
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp,
                modifier = Modifier.align(Alignment.Start)
            )
            Spacer(modifier = Modifier.height(8.dp))

            machines.forEach { machine ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Navigation, contentDescription = null, tint = AgroGreenPrimary, modifier = Modifier.size(20.dp))
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(machine.safeName, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                Text("Speed: ${machine.safeSpeed} km/h • Guntur Field Sector 4", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                        Text(
                            text = machine.safeStatus,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (machine.safeStatus == "Working" || machine.safeStatus == "Active") AgroGreenPrimary else AgroAmberAccent
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            Text(
                text = statusMessage,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(8.dp))

            Button(
                onClick = {
                    val fineGranted = ContextCompat.checkSelfPermission(
                        context,
                        Manifest.permission.ACCESS_FINE_LOCATION
                    ) == PackageManager.PERMISSION_GRANTED
                    val coarseGranted = ContextCompat.checkSelfPermission(
                        context,
                        Manifest.permission.ACCESS_COARSE_LOCATION
                    ) == PackageManager.PERMISSION_GRANTED

                    if (fineGranted || coarseGranted) {
                        try {
                            val serviceIntent = Intent(context, LocationForegroundService::class.java)
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                context.startForegroundService(serviceIntent)
                            } else {
                                context.startService(serviceIntent)
                            }
                            isTrackingActive = true
                            statusMessage = "Live GPS telemetry service is actively recording coordinates."
                        } catch (e: Exception) {
                            statusMessage = "Error starting service: ${e.localizedMessage}"
                        }
                    } else {
                        permissionLauncher.launch(requiredPermissions)
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = AgroGreenPrimary)
            ) {
                Icon(Icons.Default.GpsFixed, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text(if (isTrackingActive) "GPS Telemetry Active" else "Enable Live GPS Telemetry")
            }
        }
    }
}


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppScaffold(
    navController: NavController,
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
                        label = {
                            Text(
                                text = item.title,
                                fontSize = 10.sp,
                                maxLines = 1,
                                softWrap = false,
                                overflow = TextOverflow.Ellipsis
                            )
                        },
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

