import { GenerateCivilFile } from "./generateCivilFiles";
import { GenerateCivilFilesOverrideForPath } from "./generateCivilFilesWithOverridesForPath";
import { injectSubmissionPeriod } from "./injectSubmissionPeriod";
import { getUniqueSubmissionPeriod } from "./submissionPeriodHelper";
import { claimOptions } from "../claimOptions";
import { MONTHS } from "./submissionPeriodHelper";

/**
 * Convert "JAN-2025" → Date(2025, 0, 1)
 */
function periodToDate(period: string): Date {
    const [mon, yearStr] = period.split("-");
    return new Date(Number(yearStr), MONTHS.indexOf(mon), 1);
}

/**
 * Build valid dates for disbursement rules.
 */
function deriveValidDates(period: string) {
    const p = periodToDate(period);

    const caseStart = new Date(p);
    caseStart.setMonth(caseStart.getMonth() - 3);

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
 * 🆕 Generates a SINGLE Legal Help file
 * - Valid period
 * - Disbursement-safe dates
 * - Overrides
 */
export async function GenerateSingleLegalHelpFile(
    format: "csv" | "xml" | "txt",
    claims: claimOptions[],
    office: string
): Promise<{ file: string; period: string }> {

    // 1️⃣ Get a valid period for this office
    const { period } = await getUniqueSubmissionPeriod(office, "LEGAL HELP");

    // 2️⃣ Build date overrides
    const dates = deriveValidDates(period);

    const claimsWithDates = claims.map(c => ({
        ...c,
        ...dates
    }));

    // 3️⃣ Generate the file
    const gen = await GenerateCivilFile(1, claimsWithDates.length, format, {
        claims: claimsWithDates,
        office
    });

    const file = gen.filePaths[0];

    // 4️⃣ Inject correct submission period
    injectSubmissionPeriod(file, period);

    // 5️⃣ Apply overrides (UCN, UFN, feeCode, etc.)
    await GenerateCivilFilesOverrideForPath(file, claimsWithDates);

    return { file, period };
}
