/**
 * Centralized service for agricultural machinery service reminder calculations
 */

/**
 * Calculates service reminder parameters for a machine
 * @param {Object} machine - The machine document
 * @returns {Object} Calculated service reminder object
 */
export const calculateServiceReminder = (machine) => {
  const currentEngineHours = Math.round(machine.workingHours || machine.currentEngineHours || 0);
  const firstServiceHours = machine.firstServiceHours || 50;
  const regularServiceInterval = machine.regularServiceInterval || 250;
  const lastServiceHours = machine.lastServiceHours || 0;

  // Calculate Next Service Hours
  const nextServiceHours = lastServiceHours === 0 
    ? firstServiceHours 
    : lastServiceHours + regularServiceInterval;

  const remainingHours = nextServiceHours - currentEngineHours;

  // Calculate status and notification message
  let serviceStatus = 'Good';
  let message = 'Good';

  if (remainingHours < 0) {
    serviceStatus = 'Overdue';
    message = `Service Overdue by ${Math.abs(remainingHours)} Hours`;
  } else if (remainingHours === 0) {
    serviceStatus = 'Due Today';
    message = 'Service Due Today';
  } else if (remainingHours <= 5) {
    serviceStatus = 'Due Soon';
    message = `Service Due in ${remainingHours} Hours`;
  } else if (remainingHours <= 10) {
    serviceStatus = 'Due Soon';
    message = 'Service Due Soon';
  } else {
    serviceStatus = 'Good';
    message = 'Good';
  }

  // Estimate Next Service Date if not set
  let lastServiceDateStr = machine.lastServiceDate 
    ? new Date(machine.lastServiceDate).toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0];

  let nextServiceDateStr = machine.nextServiceDate
    ? new Date(machine.nextServiceDate).toISOString().split('T')[0]
    : null;

  if (!nextServiceDateStr) {
    // If not set, estimate next service date assuming avg 4 hours operation per day
    const daysEstimated = Math.max(1, Math.round(remainingHours / 4));
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + daysEstimated);
    nextServiceDateStr = estimatedDate.toISOString().split('T')[0];
  }

  return {
    currentEngineHours,
    nextServiceHours,
    remainingHours,
    lastServiceDate: lastServiceDateStr,
    nextServiceDate: nextServiceDateStr,
    serviceStatus,
    message
  };
};

/**
 * Updates a machine's service reminder fields in the database
 * @param {Object} machine - The machine document to update
 * @returns {Promise<Object>} Updated machine document
 */
export const updateMachineServiceStatus = async (machine) => {
  const reminder = calculateServiceReminder(machine);
  
  machine.currentEngineHours = reminder.currentEngineHours;
  machine.serviceStatus = reminder.serviceStatus;
  
  // Set dates if they aren't set yet
  if (!machine.lastServiceDate) {
    machine.lastServiceDate = new Date(reminder.lastServiceDate);
  }
  if (!machine.nextServiceDate || machine.isModified('lastServiceHours') || machine.isModified('workingHours')) {
    machine.nextServiceDate = new Date(reminder.nextServiceDate);
  }
  
  return machine;
};
