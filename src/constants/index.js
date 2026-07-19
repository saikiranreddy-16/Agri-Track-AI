// Global Constants for AgriTrack AI

export const PATHS = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/',
  FLEET_OVERVIEW: '/fleet',
  TRACKING: '/tracking',
  GPS_HISTORY: '/gps-history',
  MACHINES: '/machines',
  MACHINE_DETAIL: '/machines/:id',
  DRIVERS: '/drivers',
  DRIVER_DETAIL: '/drivers/:id',
  FIELDS: '/fields',
  JOBS: '/jobs',
  REPORTS: '/reports',
  ALERTS: '/alerts',
  MAINTENANCE: '/maintenance',
  AI_ASSISTANT: '/ai-assistant',
  AI_ADMINISTRATION: '/ai-admin',
  SETTINGS: '/settings',
  HELP: '/help',
  CUSTOMER_MANAGEMENT: '/customers',
  CUSTOMER_PROFILE: '/customers/:id',
  DEVICE_ACTIVATION: '/activate',
  DEVICE_REPLACEMENT: '/replace',
  NOTIFICATIONS: '/notifications'
};

export const ROLES = {
  COMPANY_ADMIN: 'Company Admin',
  FARM_ADMIN: 'Farm Admin',
};

export const MACHINE_STATUS = {
  WORKING: 'Working',
  IDLE: 'Idle',
  OFFLINE: 'Offline'
};

export const JOB_STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed'
};

export const PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical'
};
