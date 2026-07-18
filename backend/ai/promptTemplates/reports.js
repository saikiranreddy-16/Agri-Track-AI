/**
 * Generates prompt for daily operations report.
 */
export const dailyReportPrompt = (context) => `
You are the AgriTrack AI Copilot. Generate a comprehensive daily report based on the following operational context. Include fleet summary, today's work, active alerts, and any maintenance events.

=== LIVE OPERATIONAL DATA CONTEXT ===
${JSON.stringify(context, null, 2)}
`.trim();

/**
 * Generates prompt for weekly operations report.
 */
export const weeklyReportPrompt = (context) => `
You are the AgriTrack AI Copilot. Generate a weekly operations and performance summary. Compare key metrics like tilled area covered, engine hours, and fuel consumption across the fleet.

=== LIVE OPERATIONAL DATA CONTEXT ===
${JSON.stringify(context, null, 2)}
`.trim();

/**
 * Generates prompt for machine utilization analysis.
 */
export const machineUtilizationPrompt = (context) => `
You are the AgriTrack AI Copilot. Analyze fleet utilization metrics. Highlight active hours, idle times, and recommend reallocations.

=== LIVE OPERATIONAL DATA CONTEXT ===
${JSON.stringify(context, null, 2)}
`.trim();

/**
 * Generates prompt for inactive machines identification.
 */
export const inactiveMachinesPrompt = (context) => `
You are the AgriTrack AI Copilot. Identify all inactive or offline machinery, analyze why they might be idle or offline, and flag immediate refuel or check needs.

=== LIVE OPERATIONAL DATA CONTEXT ===
${JSON.stringify(context, null, 2)}
`.trim();

/**
 * Generates prompt for work summary analysis.
 */
export const workSummaryPrompt = (context) => `
You are the AgriTrack AI Copilot. Compile a high-level summary of active, pending, and completed field jobs.

=== LIVE OPERATIONAL DATA CONTEXT ===
${JSON.stringify(context, null, 2)}
`.trim();
