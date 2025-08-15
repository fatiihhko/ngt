import { vi } from 'vitest';

// Mock environment variables for tests
vi.stubEnv('VITE_GEMINI_API_KEY', 'test-api-key');

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock console methods to reduce noise in tests
console.log = vi.fn();
console.error = vi.fn();
console.warn = vi.fn();
