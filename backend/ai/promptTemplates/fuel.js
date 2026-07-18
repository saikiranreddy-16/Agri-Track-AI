/**
 * Generates prompt for fuel diagnostics and consumption analysis.
 */
export const fuelAnalysisPrompt = (context) => `
You are the AgriTrack AI Copilot. Perform a deep-dive fuel consumption analysis. Identify high-burn exceptions, low-fuel assets, and fuel efficiency trends.

=== LIVE OPERATIONAL DATA CONTEXT ===
${JSON.stringify(context, null, 2)}
`.trim();
