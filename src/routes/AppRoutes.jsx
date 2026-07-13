import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Login } from '../pages/Login';
import { ForgotPassword } from '../pages/ForgotPassword';
import { Dashboard } from '../pages/Dashboard';
import { FleetOverview } from '../pages/FleetOverview';
import { LiveTracking } from '../pages/LiveTracking';
import { GPSHistory } from '../pages/GPSHistory';
import { Machines } from '../pages/Machines';
import { MachineDetail } from '../pages/MachineDetail';
import { Drivers } from '../pages/Drivers';
import { DriverDetail } from '../pages/DriverDetail';
import { Fields } from '../pages/Fields';
import { Jobs } from '../pages/Jobs';
import { Reports } from '../pages/Reports';
import { Alerts } from '../pages/Alerts';
import { Maintenance } from '../pages/Maintenance';
import { AIAssistant } from '../pages/AIAssistant';
import { Settings } from '../pages/Settings';
import { Help } from '../pages/Help';
import { CustomerManagement } from '../pages/CustomerManagement';
import { CustomerProfile } from '../pages/CustomerProfile';
import { DeviceActivation } from '../pages/DeviceActivation';
import { DeviceReplacement } from '../pages/DeviceReplacement';
import { Notifications } from '../pages/Notifications';
import { NotFound } from '../pages/NotFound';
import { Unauthorized } from '../pages/Unauthorized';
import { ServerError } from '../pages/ServerError';
import { PATHS } from '../constants';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Layout pages */}
      <Route element={<AuthLayout />}>
        <Route path={PATHS.LOGIN} element={<Login />} />
        <Route path={PATHS.FORGOT_PASSWORD} element={<ForgotPassword />} />
      </Route>

      {/* Protected dashboard system pages */}
      <Route element={<DashboardLayout />}>
        <Route path={PATHS.DASHBOARD} element={<Dashboard />} />
        <Route path={PATHS.FLEET_OVERVIEW} element={<FleetOverview />} />
        <Route path={PATHS.TRACKING} element={<LiveTracking />} />
        <Route path={PATHS.GPS_HISTORY} element={<GPSHistory />} />
        <Route path={PATHS.MACHINES} element={<Machines />} />
        <Route path={PATHS.MACHINE_DETAIL} element={<MachineDetail />} />
        <Route path={PATHS.DRIVERS} element={<Drivers />} />
        <Route path={PATHS.DRIVER_DETAIL} element={<DriverDetail />} />
        <Route path={PATHS.FIELDS} element={<Fields />} />
        <Route path={PATHS.JOBS} element={<Jobs />} />
        <Route path={PATHS.REPORTS} element={<Reports />} />
        <Route path={PATHS.ALERTS} element={<Alerts />} />
        <Route path={PATHS.MAINTENANCE} element={<Maintenance />} />
        <Route path={PATHS.AI_ASSISTANT} element={<AIAssistant />} />
        <Route path={PATHS.SETTINGS} element={<Settings />} />
        <Route path={PATHS.HELP} element={<Help />} />
        <Route path={PATHS.CUSTOMER_MANAGEMENT} element={<CustomerManagement />} />
        <Route path={PATHS.CUSTOMER_PROFILE} element={<CustomerProfile />} />
        <Route path={PATHS.DEVICE_ACTIVATION} element={<DeviceActivation />} />
        <Route path={PATHS.DEVICE_REPLACEMENT} element={<DeviceReplacement />} />
        <Route path={PATHS.NOTIFICATIONS} element={<Notifications />} />
      </Route>

      {/* Error views (Unprotected / Standalone) */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/server-error" element={<ServerError />} />
      <Route path="/404" element={<NotFound />} />

      {/* Redirection fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
