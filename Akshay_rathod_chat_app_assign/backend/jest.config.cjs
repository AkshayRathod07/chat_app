module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testRegex: '\\.(test|spec)\\.ts$',
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};
