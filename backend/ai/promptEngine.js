import { buildAIContext } from './contextBuilder.js';
import * as templates from './promptTemplates/index.js';

/**
 * Prompt Engine to optimize user input, select appropriate template, and inject sanitized context.
 */
export const optimizePrompt = async (userInput, user) => {
  const context = await buildAIContext(user);
  const cleanInput = userInput.trim().toLowerCase();

  let templateFn = templates.chatPrompt;
  let promptType = 'chat';

  if (cleanInput.includes('fuel')) {
    templateFn = templates.fuelAnalysisPrompt;
    promptType = 'fuel';
  } else if (cleanInput.includes('weekly')) {
    templateFn = templates.weeklyReportPrompt;
    promptType = 'weekly';
  } else if (cleanInput.includes('daily') || cleanInput.includes("today's report") || cleanInput.includes('today report') || cleanInput.includes("today's work") || cleanInput.includes("today's report")) {
    templateFn = templates.dailyReportPrompt;
    promptType = 'daily';
  } else if (cleanInput.includes('maintenance')) {
    templateFn = templates.maintenancePredictionPrompt;
    promptType = 'maintenance';
  } else if (cleanInput.includes('utilization')) {
    templateFn = templates.machineUtilizationPrompt;
    promptType = 'utilization';
  } else if (cleanInput.includes('inactive') || cleanInput.includes('offline')) {
    templateFn = templates.inactiveMachinesPrompt;
    promptType = 'inactive';
  } else if (cleanInput.includes('gps') || cleanInput.includes('telemetry') || cleanInput.includes('distance')) {
    templateFn = templates.gpsSummaryPrompt;
    promptType = 'gps';
  } else if (cleanInput.includes('work') || cleanInput.includes('job') || cleanInput.includes('fleet')) {
    templateFn = templates.workSummaryPrompt;
    promptType = 'work';
  }

  // Generate template prompt text
  const basePromptText = promptType === 'chat' 
    ? templates.chatPrompt(context, userInput) 
    : templateFn(context);

  // Standardize the final structured optimized prompt with strict constraints for Gemini
  const optimizedPromptText = `
You are AgriTrack AI, a helpful and precise agricultural fleet operations assistant.
Your goal is to answer user questions using ONLY the supplied context data below.

=== CRITICAL CONSTRAINTS ===
1. Base your answers strictly on the supplied Fleet Context, Business Context, and Telemetry details.
2. NEVER invent, extrapolate, or hallucinate data (such as imaginary machines, telemetry coordinates, fuel levels, or job progress).
3. If the required information to answer the user's question is not available in the context, explicitly state: "I do not have access to that information in the current fleet context."
4. Do not mention internal MongoDB IDs, Device IDs, token structures, or internal settings in your answers.

Customer:
- Name: ${user.name}
- Role: ${user.role}

Fleet Context Summary:
- Total Assets: ${context.fleetSummary.totalMachines}
- Active/Working: ${context.fleetSummary.statusBreakdown.Working}
- Idle: ${context.fleetSummary.statusBreakdown.Idle}
- Maintenance: ${context.fleetSummary.statusBreakdown.Maintenance}
- Offline: ${context.fleetSummary.statusBreakdown.Offline}
- Active Farms: ${context.fleetSummary.activeFarms.join(', ') || 'None'}

=== DETAILED TELEMETRY & BUSINESS CONTEXT ===
${basePromptText}

=== CURRENT TIME REFERENCE ===
- Current Date: ${context.currentDate}
- Current Time: ${context.currentTime}

User Question:
${userInput}
  `.trim();

  return {
    optimizedPrompt: optimizedPromptText,
    promptType,
    context
  };
};
export default optimizePrompt;
