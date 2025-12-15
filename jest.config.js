module.exports = {
  preset: 'jest-expo',
  // pnpm-compatible transformIgnorePatterns
  // Must handle node_modules/.pnpm/package@version/node_modules/package structure
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!(?:.pnpm/)?(?:react-native|@react-native|expo|@expo|react-navigation|@react-navigation|@sentry|react-native-reanimated))',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',
    // Mock for react-native-worklets (may be required by some versions of reanimated)
    'react-native-worklets/plugin': '<rootDir>/__mocks__/react-native-worklets/plugin.js',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/**/index.{ts,tsx}',
  ],
  // Coverage thresholds - set to 0 for scaffold project
  // Increase these values as more tests are added
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
};
