import { describe, it, expect } from 'vitest';
import { MockProvider } from '../../../ai/providers/mockProvider.js';

describe('Mock AI Provider Tests', () => {
  it('should generate expected response formats depending on prompt content', async () => {
    const provider = new MockProvider({});
    
    const responseToday = await provider.generateResponse("today's work summary");
    expect(responseToday.text).toContain('Operations Summary');

    const responseWeek = await provider.generateResponse("weekly stats");
    expect(responseWeek.text).toContain('Weekly Operational Performance');

    const responseGeneral = await provider.generateResponse("hello");
    expect(responseGeneral.text).toContain('AgriTrack Farm Operations AI Copilot');
  });

  it('should pass simple health checks', async () => {
    const provider = new MockProvider({});
    const status = await provider.healthCheck();
    expect(status).toBe(true);
  });
});
