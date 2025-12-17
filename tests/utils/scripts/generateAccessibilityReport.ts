import fs from "fs";
import path from "path";
import axe from "axe-core";

export function addToReport(scenarioName: string | undefined, results: axe.AxeResults) {


  const reportsDir = path.join(process.cwd(), "reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, {recursive: true});
  }


  const reportPath = path.join(reportsDir, `accessibility-violations.csv`);

  const headers = ["Scenario Name", "URL", "Type", "Tags", "Timestamp", "Violation ID", "Impact", "Description", "Help", "Help URL", "Element", "HTML"];
  const rows: string[] = [];

  if (results.violations) {
    results.violations.forEach((violation) => {
      violation.nodes.forEach((node) => {
        const row = [
          scenarioName,
          results.url || "",
          "Violation",
          violation.tags.join("|"),
          new Date().toISOString(),
          violation.id,
          violation.impact || "",
          `"${violation.description.replace(/"/g, '""')}"`,
          `"${violation.help.replace(/"/g, '""')}"`,
          violation.helpUrl,
          `"${node.target.join(", ").replace(/"/g, '""')}"`,
          `"${node.html.replace(/"/g, '""')}"`
        ].join(",");
        rows.push(row);
      });
    });
  }

  if (results.incomplete) {
    results.incomplete.forEach((violation) => {
      violation.nodes.forEach((node) => {
        const row = [
          scenarioName,
          results.url || "",
          "Incomplete",
          violation.tags.join("|"),
          new Date().toISOString(),
          violation.id,
          violation.impact || "",
          `"${violation.description.replace(/"/g, '""')}"`,
          `"${violation.help.replace(/"/g, '""')}"`,
          violation.helpUrl,
          `"${node.target.join(", ").replace(/"/g, '""')}"`,
          `"${node.html.replace(/"/g, '""')}"`
        ].join(",");
        rows.push(row);
      });
    });

    if (results.inapplicable) {
      results.inapplicable.forEach((violation) => {
        violation.nodes.forEach((node) => {
          const row = [
            scenarioName,
            results.url || "",
            "Inapplicable",
            violation.tags.join("|"),
            new Date().toISOString(),
            violation.id,
            violation.impact || "",
            `"${violation.description.replace(/"/g, '""')}"`,
            `"${violation.help.replace(/"/g, '""')}"`,
            violation.helpUrl,
            `"${node.target.join(", ").replace(/"/g, '""')}"`,
            `"${node.html.replace(/"/g, '""')}"`
          ].join(",");
          rows.push(row);
        });
      });
    }

    // Don't add to report if there are no violations or incomplete violations.
    if (rows.length === 0) return;

    const fileExists = fs.existsSync(reportPath);


    if (!fileExists) {
      console.log(`Creating new report...`)
      const csvContent = [headers.join(",")].join("\n");
      fs.writeFileSync(reportPath, csvContent);
    }

    console.log(`✍🏻Adding ${rows.length} accessibility issues to ${reportPath}...`)
    fs.appendFileSync(reportPath, "\n" + rows.join("\n"));

  }
}