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
 * Generates prompt for monthly operations report.
 */
export const monthlyReportPrompt = (context) => `
You are the AgriTrack AI Copilot. Generate a monthly fleet performance and efficiency report. Track long-term trends, service frequencies, and operator allocations.

=== LIVE OPERATIONAL DATA CONTEXT ===
${JSON.stringify(context, null, 2)}
`.trim();

/**
 * Generates prompt for machine utilization analysis.
 */
export const machineUtilizationPrompt = (context) => `
You are the AgriTrack AI Copilot. Analyze fleet utilization metrics. Highlight active hours, idle times, and recommend asset reallocations.

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

/**
 * Generates prompt for machine comparisons.
 */
export const machineComparisonPrompt = (context) => `
You are the AgriTrack AI Copilot. Perform a comparative analysis between different fleet vehicles. Highlight fuel efficiency leads, health scores, and logged work hours.

=== LIVE OPERATIONAL DATA CONTEXT ===
${JSON.stringify(context, null, 2)}
`.trim();

/**
 * Generates prompt for active alerts summary.
 */
export const alertSummaryPrompt = (context) => `
You are the AgriTrack AI Copilot. Compile an active and historical alerts summary. Identify critical sensor deviations or unauthorized boundary crossings.

=== LIVE OPERATIONAL DATA CONTEXT ===
${JSON.stringify(context, null, 2)}
`.trim();

/**
 * Generates prompt for custom date range reports.
 */
export const dateRangeReportPrompt = (context) => `
You are the AgriTrack AI Copilot. Construct an operations report for the selected custom date range based on the telemetry and logs.

=== LIVE OPERATIONAL DATA CONTEXT ===
${JSON.stringify(context, null, 2)}
`.trim();

/**
 * Generates prompt for custom operational questions.
 */
export const customQuestionPrompt = (context) => `
You are the AgriTrack AI Copilot. Answer the user's custom question regarding the farm operations using this secure context.

=== LIVE OPERATIONAL DATA CONTEXT ===
${JSON.stringify(context, null, 2)}
`.trim();
