export class MockProvider {
  constructor(config) {
    this.config = config;
  }

  async generateResponse(prompt) {
    const cleanPrompt = prompt.toLowerCase();
    let text = '';

    if (cleanPrompt.includes('work') || cleanPrompt.includes('today')) {
      text = `Here is your mock operations summary for today:
      
* **Total Farms**: 2 (Grand Farm, East Fields)
* **Total Vehicles**: 3 (2 working, 1 idle)
* **Active Jobs**: 1 in progress
* **Recent Alerts**: 0 active alerts

All vehicles are operating within normal fuel and health metrics.`;
    } else if (cleanPrompt.includes('weekly') || cleanPrompt.includes('week')) {
      text = `### Weekly Operational Performance Report (Mock)

| Parameter | Value | Details |
| :--- | :--- | :--- |
| **Total Distance Covered** | 452.1 km | Calculated from GPS history |
| **Total Fuel Consumed** | 124.5 L | Fleet burn aggregate |
| **Total Engine Hours** | 24.8 hrs | Operational timeline |
| **Active Machinery** | 3 assets | Deployed units |`;
    } else if (cleanPrompt.includes('fuel')) {
      text = `**Fuel Consumption Diagnostics (Today) (Mock)**:
      
* **Aggregate Burned**: 15 Litres across active units today.
* **Low Fuel Warnings**: None. All vehicle fuel cells exceed 30%.`;
    } else if (cleanPrompt.includes('machine worked') || cleanPrompt.includes('worked the most') || cleanPrompt.includes('tractor')) {
      text = `Based on log records (Mock): The asset that worked the most is the **John Deere 5050D** (Tractor).
      
* **Total Hours Logged**: 18 Hours active.
* **Status**: Working
* **Current Fuel Level**: 78%
* **Overall Health**: 96%`;
    } else {
      text = `Hello! I am your AgriTrack Farm Operations AI Copilot (Mock).
I can analyze your fleet data, fuel usage, and job progress. Try asking:
- "Show today's work"
- "Weekly report"
- "Fuel used today"`;
    }

    return {
      text,
      tokens: Math.ceil(text.length / 4),
    };
  }
}
