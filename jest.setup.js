// Jest setup file for global test configuration

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';

// Suppress console errors in tests (optional)
// global.console = {
//   ...console,
//   error: jest.fn(),
// };
