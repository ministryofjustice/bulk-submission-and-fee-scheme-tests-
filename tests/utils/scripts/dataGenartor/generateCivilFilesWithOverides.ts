import fs from "fs";
import { GenerateCivilFile } from "./generateCivilFiles";
import { claimOptions } from "../claimOptions";

/**
 * Overrides specific CLAIM fields (UCN, UFN, feeCode) AFTER Civil file generation.
 * Ensures duplicate-check tests can set exact UCN/UFN/FEE_CODE values.
 */
export async function GenerateCivilFilesOverride(
    files: number,
    outcomes: number,
    format: "xml" | "csv" | "txt",
    options: { claims: claimOptions[]; office?: string }
): Promise<{ filePaths: string[]; office: string }> {

    const base = await GenerateCivilFile(files, outcomes, format, options);

    for (const filePath of base.filePaths) {
        let lines = fs.readFileSync(filePath, "utf8").split("\n");

        let idx = 0;

        lines = lines.map(line => {
            if (!line.startsWith("OUTCOME")) return line;

            const override = options.claims[idx];
            idx++;

            if (!override) return line;

            if (override.ucn) {
                line = line.replace(/(^|,)UCN="?([^",]+)"?/, `$1UCN=${override.ucn}`);
            }

            if (override.ufn) {
                line = line.replace(/(^|,)UFN="?([^",]+)"?/, `$1UFN=${override.ufn}`);
            }

            if (override.feeCode) {
                line = line.replace(/FEE_CODE=[^,]+/, `FEE_CODE=${override.feeCode}`);
            }

            return line;
        });

        fs.writeFileSync(filePath, lines.join("\n"), "utf8");
    }

    return base;
}
