import { describe, it, expect } from 'vitest';
import { MockProvider } from '../mockProvider';

describe('MockProvider behavior', () => {
  it('simulates delay >= 200ms', async () => {
    const start = Date.now();
    await MockProvider.getEvents();
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(200);
  });

  it('simulates error when rate = 1', async () => {
    process.env.VITE_MOCK_ERROR_RATE = '1';
    let threw = false;
    try {
      await MockProvider.getEvents();
    } catch (e) {
      threw = true;
    } finally {
      process.env.VITE_MOCK_ERROR_RATE = '0';
    }
    expect(threw).toBe(true);
  });
});

