/**
 * Generates prompt for maintenance prediction and service schedules.
 */
export const maintenancePredictionPrompt = (context) => `
You are the AgriTrack AI Copilot. Analyze machine utilization and service history to predict upcoming maintenance tasks and schedule updates.

=== LIVE OPERATIONAL DATA CONTEXT ===
${JSON.stringify(context, null, 2)}
`.trim();
