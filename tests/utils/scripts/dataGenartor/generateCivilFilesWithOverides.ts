import fs from "fs";
import { GenerateCivilFile } from "./generateCivilFiles";
import { claimOptions } from "../claimOptions";

type Format = "xml" | "csv" | "txt";

/**
 * Generates Civil files, then overrides specific OUTCOME fields
 * for validation / negative / duplicate scenarios.
 *
 * This file ONLY mutates fields that exist in the OUTCOME line.
 */
export async function GenerateCivilFilesOverride(
    files: number,
    outcomes: number,
    format: Format,
    options: { claims: claimOptions[]; office?: string }
): Promise<{ filePaths: string[]; office: string }> {

    const base = await GenerateCivilFile(files, outcomes, format, options);

    for (const filePath of base.filePaths) {
        let lines = fs.readFileSync(filePath, "utf8").split("\n");

        let outcomeIndex = 0;

        lines = lines.map(line => {
            if (!line.startsWith("OUTCOME")) return line;

            const override = options.claims[outcomeIndex++];
            if (!override) return line;

            // -----------------------
            // IDENTIFIERS
            // -----------------------

            if (override.ucn) {
                line = line.replace(
                    /UCN=[^,]+/,
                    `UCN=${override.ucn}`
                );
            }

            if (override.ufn) {
                line = line.replace(
                    /UFN=[^,]+/,
                    `UFN=${override.ufn}`
                );
            }

            if (override.feeCode) {
                line = line.replace(
                    /FEE_CODE=[^,]+/,
                    `FEE_CODE=${override.feeCode}`
                );
            }

            // -----------------------
            // DATE OVERRIDES
            // -----------------------

            if (override.caseStartDate) {
                line = line.replace(
                    /CASE_START_DATE=[^,]+/,
                    `CASE_START_DATE=${override.caseStartDate}`
                );
            }

            if (override.workConcludedDate) {
                line = line.replace(
                    /WORK_CONCLUDED_DATE=[^,]+/,
                    `WORK_CONCLUDED_DATE=${override.workConcludedDate}`
                );
            }

            if (override.transferDate) {
                line = line.replace(
                    /TRANSFER_DATE=[^,]+/,
                    `TRANSFER_DATE=${override.transferDate}`
                );
            }

            if (override.repOrderDate) {
                line = line.replace(
                    /REP_ORDER_DATE=[^,]+/,
                    `REP_ORDER_DATE=${override.repOrderDate}`
                );
            }

            if (override.clientDob) {
                line = line.replace(
                    /CLIENT_DATE_OF_BIRTH=[^,]+/,
                    `CLIENT_DATE_OF_BIRTH=${override.clientDob}`
                );
            }

            // -----------------------
            // CIVIL FINANCIAL OVERRIDES
            // -----------------------

            if (override.profitCost !== undefined) {
                const value = Number(override.profitCost);

                if (Number.isNaN(value)) {
                    throw new Error(`Invalid profitCost: ${override.profitCost}`);
                }

                line = line.replace(
                    /PROFIT_COST=[^,]+/,
                    `PROFIT_COST=${value.toFixed(2)}`
                );
            }

            if (override.counselCost !== undefined) {
                line = line.replace(
                    /COUNSEL_COST=[^,]+/,
                    `COUNSEL_COST=${override.counselCost.toFixed(2)}`
                );
            }

            if (override.disbursementAmount !== undefined) {
                line = line.replace(
                    /DISBURSEMENTS_AMOUNT=[^,]+/,
                    `DISBURSEMENTS_AMOUNT=${override.disbursementAmount.toFixed(2)}`
                );
            }

            if (override.disbursementVat !== undefined) {
                line = line.replace(
                    /DISBURSEMENTS_VAT=[^,]+/,
                    `DISBURSEMENTS_VAT=${override.disbursementVat.toFixed(2)}`
                );
            }

            // -----------------------
            // VAT INDICATOR (CIVIL)
            // -----------------------

            if (override.vatIndicator) {
                line = line.replace(
                    /VAT_INDICATOR=[^,]+/,
                    `VAT_INDICATOR=${override.vatIndicator}`
                );
            }

            return line;
        });

        fs.writeFileSync(filePath, lines.join("\n"), "utf8");
    }

    return base;
}

