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
import { Reports } from '../pages/Reports';
import { Alerts } from '../pages/Alerts';
import { Maintenance } from '../pages/Maintenance';
import { AIAssistant } from '../pages/AIAssistant';
import { AIAdministration } from '../pages/AIAdministration';
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
import { useAuth } from '../context/AuthContext';

// Protected route wrapper component
const RoleProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) {
    return <Navigate to={PATHS.LOGIN} replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Layout pages */}
      <Route element={<AuthLayout />}>
        <Route path={PATHS.LOGIN} element={<Login />} />
        <Route path={PATHS.FORGOT_PASSWORD} element={<ForgotPassword />} />
      </Route>

      {/* Protected dashboard system pages */}
      <Route element={
        <RoleProtectedRoute>
          <DashboardLayout />
        </RoleProtectedRoute>
      }>
        {/* Shared / Accessible by both */}
        <Route path={PATHS.DASHBOARD} element={<Dashboard />} />
        <Route path={PATHS.TRACKING} element={<LiveTracking />} />
        <Route path={PATHS.REPORTS} element={<Reports />} />
        <Route path={PATHS.AI_ASSISTANT} element={<AIAssistant />} />
        <Route path={PATHS.SETTINGS} element={<Settings />} />
        <Route path={PATHS.HELP} element={<Help />} />
        <Route path={PATHS.NOTIFICATIONS} element={<Notifications />} />
        <Route path={PATHS.ALERTS} element={<Alerts />} />
        <Route path={PATHS.MAINTENANCE} element={<Maintenance />} />

        {/* Company Admin Only */}
        <Route path={PATHS.AI_ADMINISTRATION} element={
          <RoleProtectedRoute allowedRoles={['Company Admin']}>
            <AIAdministration />
          </RoleProtectedRoute>
        } />
        <Route path={PATHS.FLEET_OVERVIEW} element={
          <RoleProtectedRoute allowedRoles={['Company Admin']}>
            <FleetOverview />
          </RoleProtectedRoute>
        } />
        <Route path={PATHS.CUSTOMER_MANAGEMENT} element={
          <RoleProtectedRoute allowedRoles={['Company Admin']}>
            <CustomerManagement />
          </RoleProtectedRoute>
        } />
        <Route path={PATHS.CUSTOMER_PROFILE} element={
          <RoleProtectedRoute allowedRoles={['Company Admin']}>
            <CustomerProfile />
          </RoleProtectedRoute>
        } />
        <Route path={PATHS.DEVICE_ACTIVATION} element={
          <RoleProtectedRoute allowedRoles={['Company Admin']}>
            <DeviceActivation />
          </RoleProtectedRoute>
        } />
        <Route path={PATHS.DEVICE_REPLACEMENT} element={
          <RoleProtectedRoute allowedRoles={['Company Admin']}>
            <DeviceReplacement />
          </RoleProtectedRoute>
        } />

        {/* Farm Admin Only */}
        <Route path={PATHS.MACHINES} element={
          <RoleProtectedRoute allowedRoles={['Farm Admin']}>
            <Machines />
          </RoleProtectedRoute>
        } />
        <Route path={PATHS.MACHINE_DETAIL} element={
          <RoleProtectedRoute allowedRoles={['Farm Admin']}>
            <MachineDetail />
          </RoleProtectedRoute>
        } />
        <Route path={PATHS.GPS_HISTORY} element={
          <RoleProtectedRoute allowedRoles={['Farm Admin']}>
            <GPSHistory />
          </RoleProtectedRoute>
        } />
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
