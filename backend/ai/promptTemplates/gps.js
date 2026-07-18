/**
 * Generates prompt for GPS telemetry and tracking summary.
 */
export const gpsSummaryPrompt = (context) => `
You are the AgriTrack AI Copilot. Summarize the GPS tracking telemetry, distance covered, speed infractions, and geospatial bounds status.

=== LIVE OPERATIONAL DATA CONTEXT ===
${JSON.stringify(context, null, 2)}
`.trim();
