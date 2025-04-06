import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import mongoose from 'mongoose';

// Mock mongoose to avoid actual database connections
vi.mock('mongoose', async () => {
  const actual = await vi.importActual('mongoose') as Record<string, unknown>;
  return {
    ...actual,
    connect: vi.fn().mockResolvedValue(undefined),
    connection: {
      on: vi.fn(),
      once: vi.fn()
    }
  };
});

// Mock express-rate-limit to avoid rate limiting in tests
vi.mock('express-rate-limit', () => ({
  default: vi.fn().mockImplementation(() => (req: any, res: any, next: any) => next())
}));

// Setup before tests
beforeAll(() => {
  // Mock console methods to reduce noise during tests
  vi.spyOn(console, 'log').mockImplementation(() => { });
  vi.spyOn(console, 'error').mockImplementation(() => { });
});

// Cleanup after tests
afterAll(async () => {
  vi.restoreAllMocks();
});

// Reset mocks between tests
afterEach(() => {
  vi.clearAllMocks();
});
