module.exports = {
  bulksubmission: [
    "--require-module ts-node/register",
    "--require tests/features/**/*.ts",
    "--format json:reports/cucumber.json",
    "--format html:reports/cucumber.html",
    "--tags @bulkSubmission",
    "tests/features/**/BulkSubmission/*.feature"
  ].join(" "),
  temp: [
    "--require-module ts-node/register",
    "--require tests/features/**/*.ts",
    "--format json:reports/cucumber.json",
    "--format html:reports/cucumber.html",
    "--tags @temp",
    "tests/features/**/BulkSubmission/*.feature"
  ].join(" "),
  stable: [
    "--require-module ts-node/register",
    "--require tests/features/**/*.ts",
    "--format json:reports/cucumber.json",
    "--format html:reports/cucumber.html",
    "--tags '@stable and not @ignore'",
    "--parallel 4",
    "--retry 0",
    "tests/features/**/BulkSubmission/*.feature"
  ].join(" "),
  accessibility: [
    "--require-module ts-node/register",
    "--require tests/features/**/*.ts",
    "--format json:reports/cucumber.json",
    "--format html:reports/cucumber.html",
    "--tags '@accessibility and not @ignore'",
    "tests/features/**/Accessibility/*.feature"
  ].join(" "),
  api: [
    "--require-module ts-node/register",
    "--require tests/features/**/*.ts",
    "--format json:reports/cucumber.json",
    "--format html:reports/cucumber.html",
    "--tags @api",
    "tests/features/**/*.feature"
  ],
};
