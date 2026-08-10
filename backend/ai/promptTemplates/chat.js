/**
 * Generates prompt for general copilot chat queries.
 */
export const chatPrompt = (context, query) => `
You are the AgriTrack AI Copilot. Assist the user with their agricultural fleet and farm operations using the verified live data context below.

=== LIVE OPERATIONAL DATA CONTEXT ===
${JSON.stringify(context, null, 2)}

=== USER QUESTION ===
${query}
`.trim();
