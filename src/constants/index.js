// Global Constants for AgriTrack AI

export const PATHS = {
  LOGIN: '/login',
  REGISTER: '/register',
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
  SETTINGS: '/settings',
  HELP: '/help',
  CUSTOMER_MANAGEMENT: '/customers',
  DEVICE_ACTIVATION: '/activate',
  DEVICE_REPLACEMENT: '/replace'
};

export const ROLES = {
  ADMIN: 'Admin',
  OWNER: 'Farm Owner',
  OPERATOR: 'Operator'
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
