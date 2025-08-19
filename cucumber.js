module.exports = {
  ui: [
    "--require-module ts-node/register",
    "--require tests/features/**/*.ts",
    "--format json:reports/cucumber.json",
    "--format html:reports/cucumber.html",
    "--tags @ui",
    "tests/features/**/*.feature"
  ].join(" "),
   bulksubmission: [
      "--require-module ts-node/register",
      "--require tests/features/**/*.ts",
      "--format json:reports/cucumber.json",
      "--format html:reports/cucumber.html",
      "--tags @bulkSubmission",
      "tests/features/**/BulkSubmission/*.feature"
    ].join(" "),
   smoke: [
      "--require-module ts-node/register",
      "--require tests/features/**/*.ts",
      "--format json:reports/cucumber.json",
      "--format html:reports/cucumber.html",
      "--tags @smoke",
      "tests/features/**/*.feature"
    ],
    api: [
      "--require-module ts-node/register",
      "--require tests/features/**/*.ts",
      "--format json:reports/cucumber.json",
      "--format html:reports/cucumber.html",
      "--tags @api",
      "tests/features/**/*.feature"
    ],
};
