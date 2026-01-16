import fs from "fs";
import { GenerateCivilFile } from "./generateCivilFiles";
import { claimOptions } from "../claimOptions";
import {applyImmigrationBoltOns} from "./GenerateCivilImmigrationBoltOnsOverride";

export async function GenerateLegalHelpImmigrationFilesForCalculations(
    files: number,
    outcomes: number,
    format: 'csv' | 'txt' | 'xml',
    options: { claims: any[]; office?: string }
) {


    function normaliseDate(input?: string): string | undefined {
        if (!input) return undefined;

        // Accept ISO yyyy-mm-dd and convert
        if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
            const [y, m, d] = input.split('-');
            return `${d}/${m}/${y}`;
        }

        // Already correct
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(input)) {
            return input;
        }

        throw new Error(`Invalid date format supplied: ${input}`);
    }

    function normaliseVat(input?: string): 'Y' | 'N' | undefined {
        if (!input) return undefined;

        const value = input.toString().trim().toUpperCase();

        if (value === 'Y' || value === 'YES') return 'Y';
        if (value === 'N' || value === 'NO') return 'N';

        return undefined;
    }

    function normaliseNumber(input?: string): number | undefined {
        if (!input) return undefined;

        const value = input.toString().trim();
        if (value === '') return undefined;

        const num = Number(value);
        if (Number.isNaN(num)) {
            throw new Error(`Invalid numeric value supplied: ${input}`);
        }

        return num;
    }

    const claims: claimOptions[] = options.claims.map(row => ({
        feeCode: row.feeCode,
        caseStartDate: normaliseDate(row.startDate),

        hoInterview: normaliseNumber(row.boltOnHomeOfficeInterview),
        adjournedHearing: row.boltOnAdjournedHearing ? 'Y' : undefined,
        substantiveHearing: row.boltOnSubstantiveHearing ? 'Y' : undefined,

        jrFormFilling: row.jrFormFilling
            ? Number(row.jrFormFilling)
            : undefined,

        cmrhOral: row.boltOnCmrhOral
            ? Number(row.boltOnCmrhOral)
            : undefined,

        cmrhTelephone: row.boltOnCmrhTelephone
            ? Number(row.boltOnCmrhTelephone)
            : undefined,

        detentionTravelWaitingCosts: row.detentionTravelAndWaitingCosts
            ? Number(row.detentionTravelAndWaitingCosts)
            : undefined,

        disbursementAmount: row.netDisbursementAmount
            ? Number(row.netDisbursementAmount)
            : undefined,

        disbursementVat: row.disbursementVatAmount
            ? Number(row.disbursementVatAmount)
            : undefined,

        vatApplicable: normaliseVat(row.vatIndicator),
    }));

    const result = await GenerateCivilFile(files, outcomes, format, {
        claims,
        office: options.office,
    });

    for (const filePath of result.filePaths) {
        applyImmigrationBoltOns(filePath, claims);
    }

    return result;
}
