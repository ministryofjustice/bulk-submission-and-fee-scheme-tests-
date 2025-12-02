import fs from "fs";
import { GenerateMediationFiles } from "./generateMediationFiles";
import { claimOptions } from "../claimOptions";

export async function GenerateMediationFilesOverride(
    files: number,
    outcomes: number,
    format: "xml" | "csv" | "txt",
    options: { claims: claimOptions[]; office?: string }
): Promise<{ filePaths: string[]; office: string }> {

    const base = await GenerateMediationFiles(files, outcomes, format, options);

    for (const filePath of base.filePaths) {
        let lines = fs.readFileSync(filePath, "utf8").split("\n");

        let outcomeCounter = 0;

        lines = lines.map(line => {
            if (!line.startsWith("OUTCOME")) return line;

            const ovr = options.claims[outcomeCounter];
            outcomeCounter++;

            if (!ovr) return line;

            // ⭐ Replace ONLY UCN=... at field-level, NOT CLIENT2_UCN
            if (ovr.ucn) {
                line = line.replace(/(^|,)UCN="?([^",]+)"?/, `$1UCN=${ovr.ucn}`);
            }

            if (ovr.ufn) {
                line = line.replace(/(^|,)UFN="?([^",]+)"?/, `$1UFN=${ovr.ufn}`);
            }

            if (ovr.feeCode) {
                line = line.replace(/FEE_CODE=[^,]+/, `FEE_CODE=${ovr.feeCode}`);
            }

            return line;
        });

        fs.writeFileSync(filePath, lines.join("\n"), "utf8");
    }

    return base;
}
