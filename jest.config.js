module.exports = {
  roots: ['<rootDir>/src'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  transform: {
    '.+\\.ts$': 'ts-jest'
  },
  // https://github.com/kulshekhar/ts-jest/issues/1173
  globals: {
    'ts-jest': {
      diagnostics: {
        ignoreCodes: ['TS151001']
      }
    }
  }
}
