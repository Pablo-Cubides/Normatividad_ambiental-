/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx)',
    '**/?(*.)+(spec|test).(ts|tsx)'
  ],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      useESM: false
    }],
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^next/server$': '<rootDir>/__mocks__/next-server.js',
    '^next/(.*)$': '<rootDir>/node_modules/next/$1',
    '^../src/app/layout$': '<rootDir>/__mocks__/layout.tsx',
    '^\\./layout$': '<rootDir>/__mocks__/layout.tsx',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  transformIgnorePatterns: [
    'node_modules/(?!(next|@next|react|react-dom)/)',
  ],
  globals: {
    'ts-jest': {
      useESM: false,
    },
  },
};