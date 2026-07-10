// Localized Mock Database for AgriTrack AI - Farm Operations Platform (Indian Edition)

export const mockDrivers = [
  {
    id: 'drv-1',
    name: 'Gurpreet Singh',
    phone: '+91 98765 43210',
    experience: '8 Years',
    rating: 4.8,
    status: 'Active',
    assignedMachineId: 'mach-1',
    workingHoursToday: 6.8,
    acresWorked: 18.2, // Localized: Hectares (ha) or Acres
    fuelEfficiency: 92, // %
    attendance: '98%',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
    performanceData: [
      { month: 'Jan', hours: 120, acres: 390 },
      { month: 'Feb', hours: 135, acres: 440 },
      { month: 'Mar', hours: 148, acres: 500 },
      { month: 'Apr', hours: 160, acres: 560 },
      { month: 'May', hours: 175, acres: 620 },
      { month: 'Jun', hours: 168, acres: 600 },
    ]
  },
  {
    id: 'drv-2',
    name: 'Ramesh Kumar',
    phone: '+91 98123 45678',
    experience: '5 Years',
    rating: 4.9,
    status: 'Active',
    assignedMachineId: 'mach-2',
    workingHoursToday: 5.2,
    acresWorked: 12.8,
    fuelEfficiency: 95,
    attendance: '99%',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80',
    performanceData: [
      { month: 'Jan', hours: 95, acres: 280 },
      { month: 'Feb', hours: 110, acres: 340 },
      { month: 'Mar', hours: 125, acres: 390 },
      { month: 'Apr', hours: 130, acres: 420 },
      { month: 'May', hours: 140, acres: 480 },
      { month: 'Jun', hours: 135, acres: 460 },
    ]
  },
  {
    id: 'drv-3',
    name: 'Suresh Patel',
    phone: '+91 99456 78901',
    experience: '12 Years',
    rating: 4.5,
    status: 'Active',
    assignedMachineId: 'mach-6',
    workingHoursToday: 7.4,
    acresWorked: 20.5,
    fuelEfficiency: 88,
    attendance: '95%',
    photo: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=400&h=400&q=80',
    performanceData: [
      { month: 'Jan', hours: 140, acres: 460 },
      { month: 'Feb', hours: 150, acres: 480 },
      { month: 'Mar', hours: 165, acres: 550 },
      { month: 'Apr', hours: 170, acres: 580 },
      { month: 'May', hours: 180, acres: 640 },
      { month: 'Jun', hours: 178, acres: 630 },
    ]
  },
  {
    id: 'drv-4',
    name: 'Amit Sharma',
    phone: '+91 97890 12345',
    experience: '3 Years',
    rating: 4.7,
    status: 'Active',
    assignedMachineId: 'mach-4',
    workingHoursToday: 4.8,
    acresWorked: 11.2,
    fuelEfficiency: 91,
    attendance: '97%',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&h=400&q=80',
    performanceData: [
      { month: 'Jan', hours: 80, acres: 240 },
      { month: 'Feb', hours: 90, acres: 270 },
      { month: 'Mar', hours: 105, acres: 320 },
      { month: 'Apr', hours: 115, acres: 360 },
      { month: 'May', hours: 120, acres: 380 },
      { month: 'Jun', hours: 118, acres: 370 },
    ]
  },
  {
    id: 'drv-5',
    name: 'Harpreet Kaur',
    phone: '+91 96234 56789',
    experience: '6 Years',
    rating: 4.8,
    status: 'Active',
    assignedMachineId: 'mach-5',
    workingHoursToday: 6.0,
    acresWorked: 15.6,
    fuelEfficiency: 93,
    attendance: '98%',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
    performanceData: [
      { month: 'Jan', hours: 110, acres: 340 },
      { month: 'Feb', hours: 115, acres: 360 },
      { month: 'Mar', hours: 125, acres: 400 },
      { month: 'Apr', hours: 135, acres: 440 },
      { month: 'May', hours: 150, acres: 500 },
      { month: 'Jun', hours: 145, acres: 480 },
    ]
  },
  {
    id: 'drv-6',
    name: 'Manpreet Singh',
    phone: '+91 95123 98765',
    experience: '10 Years',
    rating: 4.6,
    status: 'Off-duty',
    assignedMachineId: 'mach-8',
    workingHoursToday: 0,
    acresWorked: 0,
    fuelEfficiency: 90,
    attendance: '96%',
    photo: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&h=400&q=80',
    performanceData: [
      { month: 'Jan', hours: 130, acres: 400 },
      { month: 'Feb', hours: 140, acres: 450 },
      { month: 'Mar', hours: 150, acres: 500 },
      { month: 'Apr', hours: 160, acres: 540 },
      { month: 'May', hours: 170, acres: 580 },
      { month: 'Jun', hours: 0, acres: 0 },
    ]
  }
];

export const mockMachines = [
  {
    id: 'mach-1',
    name: 'Mahindra Novo 755 DI',
    type: 'Tractor',
    brand: 'Mahindra',
    model: 'Novo 755 DI',
    registration: 'PB-10-CD-4512',
    status: 'Working',
    fuel: 82,
    battery: 96,
    assignedDriverId: 'drv-1',
    location: { lat: 30.902, lng: 75.853 },
    speed: 12,
    engineStatus: 'On',
    workingHours: 245.5,
    distanceTravelled: 1240.2,
    nextService: '2026-08-15',
    currentAddress: 'Sector 4, Central Wheat Block, Ludhiana, Punjab',
    photo: 'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=800&q=80',
    documents: ['Novo_755_Operator_Manual.pdf', 'Service_Warranty_Mahindra.pdf'],
    workHistory: [
      { id: 'wh-1', job: 'Soil Tilling', date: '2026-07-06', hours: 6.8, driver: 'Gurpreet Singh' },
      { id: 'wh-2', job: 'Fertilizing', date: '2026-07-04', hours: 5.2, driver: 'Gurpreet Singh' }
    ],
    fuelHistory: [
      { date: 'Jul 01', level: 95 },
      { date: 'Jul 02', level: 80 },
      { date: 'Jul 03', level: 62 },
      { date: 'Jul 04', level: 90 },
      { date: 'Jul 05', level: 75 },
      { date: 'Jul 06', level: 82 }
    ],
    maintenanceHistory: [
      { id: 'mh-1', action: 'Engine Oil & Filter Change', date: '2026-06-12', cost: 4500 },
      { id: 'mh-2', action: 'Tire Pressure Alignment', date: '2026-05-01', cost: 1200 }
    ],
    alerts: [
      { id: 'a-m1-1', type: 'Low Fuel Warning', date: '2026-06-28', status: 'Resolved' }
    ]
  },
  {
    id: 'mach-2',
    name: 'Swaraj 963 FE',
    type: 'Tractor',
    brand: 'Swaraj',
    model: '963 FE',
    registration: 'PB-10-EF-8976',
    status: 'Working',
    fuel: 45,
    battery: 92,
    assignedDriverId: 'drv-2',
    location: { lat: 30.898, lng: 75.862 },
    speed: 8,
    engineStatus: 'On',
    workingHours: 512.2,
    distanceTravelled: 3210.8,
    nextService: '2026-07-28',
    currentAddress: 'Sector 12, South Corn Basin, Ludhiana, Punjab',
    photo: 'https://images.unsplash.com/photo-1595246140625-5c3b545b0976?auto=format&fit=crop&w=800&q=80',
    documents: ['Swaraj_963FE_Harvest_Guide.pdf'],
    workHistory: [
      { id: 'wh-3', job: 'Corn Harvesting', date: '2026-07-06', hours: 5.2, driver: 'Ramesh Kumar' }
    ],
    fuelHistory: [
      { date: 'Jul 01', level: 85 },
      { date: 'Jul 02', level: 65 },
      { date: 'Jul 03', level: 45 }
    ],
    maintenanceHistory: [
      { id: 'mh-3', action: 'Blade Sharpening', date: '2026-06-20', cost: 6800 }
    ],
    alerts: []
  },
  {
    id: 'mach-3',
    name: 'Sonalika Tiger DI 75',
    type: 'Tractor',
    brand: 'Sonalika',
    model: 'Tiger DI 75',
    registration: 'HR-26-AB-9912',
    status: 'Offline',
    fuel: 12,
    battery: 85,
    assignedDriverId: null,
    location: { lat: 30.891, lng: 75.845 },
    speed: 0,
    engineStatus: 'Off',
    workingHours: 189.0,
    distanceTravelled: 980.5,
    nextService: '2026-07-15',
    currentAddress: 'Maintenance Yard Depot, Ludhiana, Punjab',
    photo: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
    documents: ['Tiger_75_Tech_Manual.pdf'],
    workHistory: [
      { id: 'wh-4', job: 'Sowing Rice', date: '2026-06-30', hours: 8.0, driver: 'Suresh Patel' }
    ],
    fuelHistory: [
      { date: 'Jun 28', level: 50 },
      { date: 'Jun 29', level: 30 },
      { date: 'Jun 30', level: 12 }
    ],
    maintenanceHistory: [
      { id: 'mh-4', action: 'Hydraulic Hose Replacement', date: '2026-07-01', cost: 3800 }
    ],
    alerts: [
      { id: 'a-m3-1', type: 'GPS Signal Offline', date: '2026-07-07', status: 'Active' }
    ]
  },
  {
    id: 'mach-4',
    name: 'John Deere 5310 GearPro',
    type: 'Tractor',
    brand: 'John Deere',
    model: '5310 GearPro',
    registration: 'PB-10-XY-2345',
    status: 'Working',
    fuel: 94,
    battery: 98,
    assignedDriverId: 'drv-4',
    location: { lat: 30.905, lng: 75.870 },
    speed: 15,
    engineStatus: 'On',
    workingHours: 94.2,
    distanceTravelled: 450.1,
    nextService: '2026-09-02',
    currentAddress: 'East Meadow, Ludhiana, Punjab',
    photo: 'https://images.unsplash.com/photo-1594142426444-a4cd02470991?auto=format&fit=crop&w=800&q=80',
    documents: ['JD_5310_Manual.pdf'],
    workHistory: [
      { id: 'wh-5', job: 'Spraying Pesticides', date: '2026-07-06', hours: 4.8, driver: 'Amit Sharma' }
    ],
    fuelHistory: [
      { date: 'Jul 04', level: 105 },
      { date: 'Jul 06', level: 94 }
    ],
    maintenanceHistory: [],
    alerts: []
  },
  {
    id: 'mach-5',
    name: 'TAFE 30 DI Orchard',
    type: 'Tractor',
    brand: 'TAFE',
    model: '30 DI Orchard',
    registration: 'MH-15-ZA-7721',
    status: 'Idle',
    fuel: 68,
    battery: 94,
    assignedDriverId: 'drv-5',
    location: { lat: 30.895, lng: 75.850 },
    speed: 0,
    engineStatus: 'Off',
    workingHours: 342.1,
    distanceTravelled: 1890.3,
    nextService: '2026-08-01',
    currentAddress: 'Section 8 Headlands, Ludhiana, Punjab',
    photo: 'https://images.unsplash.com/photo-1530982009887-a6558440dd1a?auto=format&fit=crop&w=800&q=80',
    documents: ['TAFE_30DI_Operator_Guide.pdf'],
    workHistory: [
      { id: 'wh-6', job: 'Cultivating Field C', date: '2026-07-05', hours: 6.0, driver: 'Harpreet Kaur' }
    ],
    fuelHistory: [
      { date: 'Jul 04', level: 80 },
      { date: 'Jul 05', level: 68 }
    ],
    maintenanceHistory: [],
    alerts: []
  },
  {
    id: 'mach-6',
    name: 'Preet 6049 Super',
    type: 'Tractor',
    brand: 'Preet',
    model: '6049 Super',
    registration: 'PB-11-JK-3420',
    status: 'Working',
    fuel: 55,
    battery: 91,
    assignedDriverId: 'drv-3',
    location: { lat: 30.888, lng: 75.855 },
    speed: 10,
    engineStatus: 'On',
    workingHours: 120.4,
    distanceTravelled: 720.5,
    nextService: '2026-08-20',
    currentAddress: 'West Side Alfalfa Field, Ludhiana, Punjab',
    photo: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
    documents: ['Preet_6049_UserManual.pdf'],
    workHistory: [
      { id: 'wh-7', job: 'Hay Baling', date: '2026-07-06', hours: 7.4, driver: 'Suresh Patel' }
    ],
    fuelHistory: [
      { date: 'Jul 05', level: 85 },
      { date: 'Jul 06', level: 55 }
    ],
    maintenanceHistory: [],
    alerts: []
  },
  {
    id: 'mach-7',
    name: 'Kartar 4000 Harvester',
    type: 'Harvester',
    brand: 'Kartar',
    model: '4000 Combo',
    registration: 'PB-10-LM-1002',
    status: 'Maintenance',
    fuel: 0,
    battery: 10,
    assignedDriverId: null,
    location: { lat: 30.912, lng: 75.865 },
    speed: 0,
    engineStatus: 'Off',
    workingHours: 788.5,
    distanceTravelled: 5420.1,
    nextService: '2026-07-05', // Past due
    currentAddress: 'North Machinery Hangar, Ludhiana, Punjab',
    photo: 'https://images.unsplash.com/photo-1594913785162-e6785b4ddee3?auto=format&fit=crop&w=800&q=80',
    documents: ['Kartar_4000_OperatorManual.pdf'],
    workHistory: [],
    fuelHistory: [],
    maintenanceHistory: [
      { id: 'mh-5', action: 'Engine Refurbishing', date: '2026-06-01', cost: 18500 }
    ],
    alerts: [
      { id: 'a-m7-1', type: 'Battery Voltage Low', date: '2026-07-07', status: 'Active' },
      { id: 'a-m7-2', type: 'Maintenance Overdue', date: '2026-07-05', status: 'Active' }
    ]
  },
  {
    id: 'mach-8',
    name: 'Sonalika Rice Transplanter',
    type: 'Sprayer',
    brand: 'Sonalika',
    model: 'Transplanter 4Row',
    registration: 'PB-12-RS-5612',
    status: 'Idle',
    fuel: 72,
    battery: 88,
    assignedDriverId: 'drv-6',
    location: { lat: 30.885, lng: 75.840 },
    speed: 0,
    engineStatus: 'Off',
    workingHours: 150.3,
    distanceTravelled: 950.4,
    nextService: '2026-08-10',
    currentAddress: 'Chemical Load Yard, Ludhiana, Punjab',
    photo: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
    documents: ['Sonalika_Rice_UserManual.pdf'],
    workHistory: [
      { id: 'wh-8', job: 'Fertilizing Rice Field', date: '2026-07-05', hours: 3.5, driver: 'Manpreet Singh' }
    ],
    fuelHistory: [
      { date: 'Jul 04', level: 90 },
      { date: 'Jul 05', level: 72 }
    ],
    maintenanceHistory: [],
    alerts: []
  }
];

export const mockFields = [
  {
    id: 'field-1',
    name: 'North Wheat Block',
    area: 30, // Hectares
    crop: 'Wheat',
    owner: 'Punjab Agrotech Co.',
    machineAssigned: 'mach-1',
    status: 'In Progress',
    boundaries: [
      [30.900, 75.850],
      [30.906, 75.850],
      [30.906, 75.856],
      [30.900, 75.856]
    ]
  },
  {
    id: 'field-2',
    name: 'South Rice Sector',
    area: 55,
    crop: 'Rice',
    owner: 'Singh Family Estates',
    machineAssigned: 'mach-2',
    status: 'In Progress',
    boundaries: [
      [30.895, 75.858],
      [30.901, 75.858],
      [30.901, 75.866],
      [30.895, 75.866]
    ]
  },
  {
    id: 'field-3',
    name: 'East Cotton Fields',
    area: 45,
    crop: 'Cotton',
    owner: 'Punjab Agrotech Co.',
    machineAssigned: 'mach-4',
    status: 'Completed',
    boundaries: [
      [30.902, 75.867],
      [30.908, 75.867],
      [30.908, 75.875],
      [30.902, 75.875]
    ]
  },
  {
    id: 'field-4',
    name: 'West Sugarcane Meadows',
    area: 25,
    crop: 'Sugarcane',
    owner: 'Karnal Farmers Trust',
    machineAssigned: 'mach-6',
    status: 'Completed',
    boundaries: [
      [30.885, 75.850],
      [30.892, 75.850],
      [30.892, 75.860],
      [30.885, 75.860]
    ]
  }
];

export const mockJobs = [
  {
    id: 'job-1',
    title: 'Rice Sowing Block A',
    machineId: 'mach-1',
    driverId: 'drv-1',
    startDate: '2026-07-06',
    endDate: '2026-07-08',
    status: 'In Progress',
    priority: 'High',
    progress: 75,
    timeline: [
      { date: '2026-07-06 08:00', title: 'Job Deployed', desc: 'Gurpreet Singh deployed with Mahindra Novo 755' },
      { date: '2026-07-06 12:00', title: 'Tilled 10 Hectares', desc: 'Soil moisture nominal, working at 12 km/h' },
      { date: '2026-07-07 10:00', title: 'Tilled 22 Hectares', desc: 'Progressing towards East Headlands' }
    ]
  },
  {
    id: 'job-2',
    title: 'Wheat Harvesting Section 12',
    machineId: 'mach-2',
    driverId: 'drv-2',
    startDate: '2026-07-06',
    endDate: '2026-07-10',
    status: 'In Progress',
    priority: 'High',
    progress: 42,
    timeline: [
      { date: '2026-07-06 09:00', title: 'Harvest Deployed', desc: 'Swaraj Harvester deployed with operator Ramesh Kumar' }
    ]
  },
  {
    id: 'job-3',
    title: 'Sugarcane Planting Meadow',
    machineId: 'mach-3',
    driverId: null,
    startDate: '2026-07-12',
    endDate: '2026-07-15',
    status: 'Pending',
    priority: 'Medium',
    progress: 0,
    timeline: []
  },
  {
    id: 'job-4',
    title: 'Pesticide Spraying Cotton',
    machineId: 'mach-4',
    driverId: 'drv-4',
    startDate: '2026-07-05',
    endDate: '2026-07-05',
    status: 'Completed',
    priority: 'Low',
    progress: 100,
    timeline: [
      { date: '2026-07-05 08:00', title: 'Spraying Started', desc: 'John Deere 5310 deployed with Amit Sharma' },
      { date: '2026-07-05 16:30', title: 'Spraying Finished', desc: '45 Hectares fully completed' }
    ]
  }
];

export const mockAlerts = [
  {
    id: 'alert-1',
    type: 'Low Fuel',
    message: 'Sonalika Tiger DI (mach-3) has critical fuel level (12%)',
    machineId: 'mach-3',
    driverName: 'Not Assigned',
    time: '10 mins ago',
    priority: 'High',
    category: 'Fuel',
    status: 'Active'
  },
  {
    id: 'alert-2',
    type: 'GPS Offline',
    message: 'GPS connection lost for Kartar Harvester (mach-7)',
    machineId: 'mach-7',
    driverName: 'Not Assigned',
    time: '32 mins ago',
    priority: 'Critical',
    category: 'GPS',
    status: 'Active'
  },
  {
    id: 'alert-3',
    type: 'Maintenance Due',
    message: 'Swaraj Harvester service period overdue',
    machineId: 'mach-2',
    driverName: 'Ramesh Kumar',
    time: '2 hours ago',
    priority: 'Medium',
    category: 'Maintenance',
    status: 'Active'
  },
  {
    id: 'alert-4',
    type: 'Engine Off',
    message: 'Unscheduled engine shutdown for TAFE Orchard (mach-5)',
    machineId: 'mach-5',
    driverName: 'Harpreet Kaur',
    time: '4 hours ago',
    priority: 'Low',
    category: 'System',
    status: 'Active'
  },
  {
    id: 'alert-5',
    type: 'Battery Low',
    message: 'Kartar Harvester voltage under 11.2V',
    machineId: 'mach-7',
    driverName: 'Not Assigned',
    time: '1 day ago',
    priority: 'High',
    category: 'System',
    status: 'Active'
  }
];

export const mockHistoryPaths = {
  'mach-1': [
    { lat: 30.900, lng: 75.850, speed: 10, fuel: 90, timestamp: '08:00 AM' },
    { lat: 30.901, lng: 75.851, speed: 12, fuel: 88, timestamp: '08:15 AM' },
    { lat: 30.902, lng: 75.852, speed: 11, fuel: 87, timestamp: '08:30 AM' },
    { lat: 30.903, lng: 75.853, speed: 13, fuel: 85, timestamp: '08:45 AM' },
    { lat: 30.904, lng: 75.854, speed: 12, fuel: 83, timestamp: '09:00 AM' },
    { lat: 30.902, lng: 75.853, speed: 12, fuel: 82, timestamp: '09:15 AM' }
  ],
  'mach-2': [
    { lat: 30.895, lng: 75.858, speed: 6, fuel: 55, timestamp: '10:00 AM' },
    { lat: 30.896, lng: 75.859, speed: 7, fuel: 52, timestamp: '10:30 AM' },
    { lat: 30.897, lng: 75.860, speed: 8, fuel: 50, timestamp: '11:00 AM' },
    { lat: 30.898, lng: 75.861, speed: 7, fuel: 48, timestamp: '11:30 AM' },
    { lat: 30.898, lng: 75.862, speed: 8, fuel: 45, timestamp: '12:00 PM' }
  ]
};

export const mockHistoryStops = {
  'mach-1': [
    { name: 'Depot Start', lat: 30.900, lng: 75.850, duration: '10 mins', timestamp: '08:00 AM' },
    { name: 'Field Refuel Stop', lat: 30.902, lng: 75.852, duration: '15 mins', timestamp: '08:30 AM' }
  ],
  'mach-2': [
    { name: 'Loading Zone 1', lat: 30.896, lng: 75.859, duration: '20 mins', timestamp: '10:30 AM' }
  ]
};

export const mockMaintenanceSchedule = {
  upcoming: [
    { id: 'm-up-1', machine: 'Mahindra Novo 755', machineId: 'mach-1', task: 'Hydraulic Fluid Top-Up', date: '2026-07-15', priority: 'High', type: 'Hydraulics' },
    { id: 'm-up-2', machine: 'John Deere 5310', machineId: 'mach-4', task: 'Air Filter Cleaning & Replace', date: '2026-07-22', priority: 'Medium', type: 'Engine' },
    { id: 'm-up-3', machine: 'Sonalika Tiger 75', machineId: 'mach-3', task: 'Full Electrical Systems check', date: '2026-07-29', priority: 'High', type: 'Electrical' },
    { id: 'm-up-4', machine: 'Preet 6049 Super', machineId: 'mach-6', task: 'Transmission Oil Inspection', date: '2026-08-05', priority: 'Low', type: 'Transmission' }
  ],
  history: [
    { id: 'm-hi-1', machine: 'Mahindra Novo 755', machineId: 'mach-1', task: 'Engine Oil & Filter Change', date: '2026-06-12', mechanic: 'Gurpreet Singh (Operator Check)', cost: 4500, notes: 'Replaced with OEM Mahindra Engine Oil.' },
    { id: 'm-hi-2', machine: 'Swaraj 963 FE', machineId: 'mach-2', task: 'Blade Sharpening & Cylinder Balance', date: '2026-06-20', mechanic: 'Swaraj Service Rep', cost: 6800, notes: 'Main threshing cylinder recalibrated.' },
    { id: 'm-hi-3', machine: 'Kartar 4000 Harvester', machineId: 'mach-7', task: 'Coolant Hose replacement & Radiator flush', date: '2026-06-01', mechanic: 'Ludhiana Workshop', cost: 3500, notes: 'Minor leak resolved.' }
  ]
};
