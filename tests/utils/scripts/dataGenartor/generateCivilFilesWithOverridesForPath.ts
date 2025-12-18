import fs from "fs";
import { claimOptions } from "../claimOptions";

/**
 * Applies overrides (UCN, UFN, feeCode) to a specific Legal Help file.
 * Safe for parallel test execution and multi-file generation.
 */
export async function GenerateCivilFilesOverrideForPath(
    filePath: string,
    claims: claimOptions[]
): Promise<void> {

    let lines = fs.readFileSync(filePath, "utf8").split("\n");

    let index = 0;

    const updated = lines.map((line) => {
        if (!line.startsWith("OUTCOME")) return line;

        const override = claims[index];
        index++;

        if (!override) return line;

        let updatedLine = line;

        // ⭐ UCN override
        if (override.ucn) {
            updatedLine = updatedLine.replace(
                /(^|,)UCN="?([^",]+)"?/,
                `$1UCN=${override.ucn}`
            );
        }

        // ⭐ UFN override
        if (override.ufn) {
            updatedLine = updatedLine.replace(
                /(^|,)UFN="?([^",]+)"?/,
                `$1UFN=${override.ufn}`
            );
        }

        // ⭐ Fee code override
        if (override.feeCode) {
            updatedLine = updatedLine.replace(
                /FEE_CODE=[^,]+/,
                `FEE_CODE=${override.feeCode}`
            );
        }

        return updatedLine;
    });

    fs.writeFileSync(filePath, updated.join("\n"), "utf8");
}
