module.exports = {
   bulksubmission: [
      "--require-module ts-node/register",
      "--require tests/features/**/*.ts",
      "--format json:reports/cucumber.json",
      "--format html:reports/cucumber.html",
      "--tags @bulkSubmission",
      "tests/features/**/BulkSubmission/*.feature"
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
