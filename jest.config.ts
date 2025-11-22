import {JestConfigWithTsJest} from 'ts-jest';

const config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', 'out/'],
  moduleNameMapper: {
    '@/core/(.*)': '<rootDir>/src/core/$1',
    '@/infrastructure/(.*)': '<rootDir>/src/infrastructure/$1',
    '@/shared/(.*)': '<rootDir>/src/shared/$1',
  },
  setupFiles: ['<rootDir>/jest.setup.ts'],
  coverageReporters: ['json-summary', 'lcov', 'text'],
};

export default config;
