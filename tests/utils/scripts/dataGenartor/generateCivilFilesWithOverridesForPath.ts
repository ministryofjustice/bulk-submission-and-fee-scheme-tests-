import fs from "fs";
import { claimOptions } from "../claimOptions";

/**
 * Applies claim overrides to a specific Legal Help file.
 * Safe for parallel test execution and multi-file generation.
 */
export async function GenerateCivilFilesOverrideForPath(
    filePath: string,
    claims: claimOptions[]
): Promise<void> {

    const lines = fs.readFileSync(filePath, "utf8").split("\n");

    let index = 0;

    const replaceField = (
        line: string,
        fieldName: string,
        value?: string
    ): string => {
        if (!value) return line;

        const regex = new RegExp(`(^|,)${fieldName}="?([^",]+)"?`);
        return line.replace(regex, `$1${fieldName}=${value}`);
    };

    const updated = lines.map((line) => {
        if (!line.startsWith("OUTCOME")) return line;

        const override = claims[index];
        index++;

        if (!override) return line;

        let updatedLine = line;

        updatedLine = replaceField(updatedLine, "UCN", override.ucn);
        updatedLine = replaceField(updatedLine, "UFN", override.ufn);
        updatedLine = replaceField(updatedLine, "FEE_CODE", override.feeCode);

        updatedLine = replaceField(
            updatedLine,
            "WORK_CONCLUDED_DATE",
            override.workConcludedDate
        );

        updatedLine = replaceField(
            updatedLine,
            "TRANSFER_DATE",
            override.transferDate
        );

        updatedLine = replaceField(
            updatedLine,
            "SURGERY_DATE",
            override.surgeryDate
        );

        updatedLine = replaceField(
            updatedLine,
            "CASE_START_DATE",
            override.caseStartDate
        );

        return updatedLine;
    });

    fs.writeFileSync(filePath, updated.join("\n"), "utf8");
}