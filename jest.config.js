module.exports = {
  globals: {
    "ts-jest": {
      disableSourceMapSupport: true,
    },
  },
  verbose: true,
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  preset: "ts-jest",
  node: true,
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testURL: "http://localhost",
  transformIgnorePatterns: ["[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$"],
  testMatch: ["**/*.(spec|test).{ts,tsx}"],
  collectCoverage: true,
  collectCoverageFrom: [
    "config/**/*.{ts,tsx}",
    "src/**/*.{ts,tsx}",
    "!src/naptime/**/*",
  ],
  coverageDirectory: "./coverage/",
  watchPlugins: [
    require.resolve("jest-watch-typeahead/filename"),
    require.resolve("jest-watch-typeahead/testname"),
  ],
};
