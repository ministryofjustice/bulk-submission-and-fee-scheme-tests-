import fs from "fs";

/**
 * Injects a specific submissionPeriod into a generated Legal Help file.
 */
export function injectSubmissionPeriod(filePath: string, period: string) {
    const lines = fs.readFileSync(filePath, "utf8").split("\n");

    const updated = lines.map((line) =>
        line.startsWith("SCHEDULE")
            ? line.replace(/submissionPeriod=[A-Z]{3}-\d{4}/, `submissionPeriod=${period}`)
            : line
    );

    fs.writeFileSync(filePath, updated.join("\n"), "utf8");
}
