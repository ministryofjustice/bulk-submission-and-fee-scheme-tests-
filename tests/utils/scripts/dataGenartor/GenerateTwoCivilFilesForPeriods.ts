import { GenerateCivilFile } from "./generateCivilFiles";
import { GenerateCivilFilesOverrideForPath } from "./generateCivilFilesWithOverridesForPath";
import { injectSubmissionPeriod } from "./injectSubmissionPeriod";
import { getTwoValidPeriodsApart } from "./submissionPeriodRangeHelper";
import { claimOptions } from "../claimOptions";
import { MONTHS } from "./submissionPeriodHelper";

/**
 * Convert period like "JAN-2025" → Date(2025, 0, 1)
 */
function periodToDate(period: string): Date {
    const [mon, yearStr] = period.split("-");
    const monthIndex = MONTHS.indexOf(mon);
    return new Date(Number(yearStr), monthIndex, 1);
}

/**
 * Legal Help Disbursement Rule:
 * CaseStartDate must be ≥ 3 months before submissionPeriod.
 */
function deriveValidDates(period: string) {
    const periodDate = periodToDate(period);

    // CaseStart = period - 3 months
    const caseStart = new Date(periodDate);
    caseStart.setMonth(caseStart.getMonth() - 3);

    // All other dates must be after caseStart
    const nextDay = new Date(caseStart);
    nextDay.setDate(nextDay.getDate() + 1);

    const fmt = (d: Date) =>
        d.toISOString().split("T")[0].split("-").reverse().join("/");

    return {
        caseStartDate: fmt(caseStart),
        workConcludedDate: fmt(nextDay),
        transferDate: fmt(nextDay),
        surgeryDate: fmt(nextDay)
    };
}

/**
 * Generates two Legal Help files with:
 *  ✔ Valid separated submission periods
 *  ✔ Correct office (with fallback)
 *  ✔ Valid disbursement date rules
 *  ✔ UCN/UFN/FEE_CODE overrides applied
 */
export async function GenerateTwoLegalHelpFiles(
    format: "csv" | "xml" | "txt",
    claimsFile1: claimOptions[],
    claimsFile2: claimOptions[],
    office: string,
    monthsDiff: number
) {
    const { period1, period2 } =
        await getTwoValidPeriodsApart(office, "LEGAL HELP", monthsDiff);

    const dates1 = deriveValidDates(period1);
    const dates2 = deriveValidDates(period2);

    const claims1 = claimsFile1.map(c => ({ ...c, ...dates1 }));
    const claims2 = claimsFile2.map(c => ({ ...c, ...dates2 }));

    const gen1 = await GenerateCivilFile(1, claims1.length, format, {
        claims: claims1,
        office
    });
    const firstFile = gen1.filePaths[0];
    injectSubmissionPeriod(firstFile, period1);
    await GenerateCivilFilesOverrideForPath(firstFile, claims1);

    const gen2 = await GenerateCivilFile(1, claims2.length, format, {
        claims: claims2,
        office
    });
    const secondFile = gen2.filePaths[0];
    injectSubmissionPeriod(secondFile, period2);
    await GenerateCivilFilesOverrideForPath(secondFile, claims2);

    return { firstFile, secondFile, period1, period2 };
}