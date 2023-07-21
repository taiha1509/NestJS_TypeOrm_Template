module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec|e2e-spec))\\.ts?$',
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    testPathIgnorePatterns: [
        '<rootDir>/build/',
        '<rootDir>/node_modules/',
        '<rootDir>/dist/',
    ],
    transformIgnorePatterns: ['/node_modules/', '\\.pnp\\.[^\\/]+$'],
    coverageDirectory: './coverage',
};
