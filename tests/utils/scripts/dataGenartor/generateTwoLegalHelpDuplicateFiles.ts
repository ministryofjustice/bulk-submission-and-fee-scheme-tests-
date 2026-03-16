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

function formatDate(d: Date): string {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Base valid Legal Help dates.
 * Keeps files structurally valid.
 */
function deriveValidDates(period: string) {
    const periodDate = periodToDate(period);

    const caseStart = new Date(periodDate);
    caseStart.setMonth(caseStart.getMonth() - 3);

    const nextDay = new Date(caseStart);
    nextDay.setDate(nextDay.getDate() + 1);

    return {
        caseStartDate: formatDate(caseStart),
        workConcludedDate: formatDate(nextDay),
        transferDate: formatDate(nextDay),
        surgeryDate: formatDate(nextDay)
    };
}

function getLaterPeriod(period1: string, period2: string): string {
    return periodToDate(period1) >= periodToDate(period2) ? period1 : period2;
}

/**
 * Duplicate rule:
 * AnchorPeriod = later(submission period of incoming, submission period of anchor candidate)
 * CutoffPeriod = AnchorPeriod - 3 months
 * CutoffDate = 20th of following month
 */
function getDuplicateCutoffDate(period1: string, period2: string): Date {
    const anchorPeriod = getLaterPeriod(period1, period2);
    const anchorDate = periodToDate(anchorPeriod);

    const cutoffPeriod = new Date(anchorDate);
    cutoffPeriod.setMonth(cutoffPeriod.getMonth() - 3);

    return new Date(
        cutoffPeriod.getFullYear(),
        cutoffPeriod.getMonth() + 1,
        20
    );
}

/**
 * Generates CCDs that guarantee duplicate rejection:
 * file1 CCD = cutoff + 1 day
 * file2 CCD = cutoff + 2 days
 */
function deriveDuplicateRejectDates(period1: string, period2: string) {
    const cutoffDate = getDuplicateCutoffDate(period1, period2);

    const firstCcd = new Date(cutoffDate);
    firstCcd.setDate(firstCcd.getDate() + 1);

    const secondCcd = new Date(cutoffDate);
    secondCcd.setDate(secondCcd.getDate() + 2);

    return {
        cutoffDate: formatDate(cutoffDate),
        firstWorkConcludedDate: formatDate(firstCcd),
        secondWorkConcludedDate: formatDate(secondCcd)
    };
}

/**
 * Generates two Legal Help files specifically for duplicate rejection testing.
 */
export async function GenerateTwoLegalHelpDuplicateFiles(
    format: "csv" | "xml" | "txt",
    claimsFile1: claimOptions[],
    claimsFile2: claimOptions[],
    office: string,
    monthsDiff: number
) {
    const { officeUsed, period1, period2 } =
        await getTwoValidPeriodsApart(office, "LEGAL HELP", monthsDiff);

    const dates1 = deriveValidDates(period1);
    const dates2 = deriveValidDates(period2);

    const duplicateDates = deriveDuplicateRejectDates(period1, period2);

    const claims1 = claimsFile1.map(c => ({
        ...dates1,
        ...c,
        workConcludedDate: duplicateDates.firstWorkConcludedDate,
        transferDate: duplicateDates.firstWorkConcludedDate,
        surgeryDate: duplicateDates.firstWorkConcludedDate
    }));

    const claims2 = claimsFile2.map(c => ({
        ...dates2,
        ...c,
        workConcludedDate: duplicateDates.secondWorkConcludedDate,
        transferDate: duplicateDates.secondWorkConcludedDate,
        surgeryDate: duplicateDates.secondWorkConcludedDate
    }));

    const gen1 = await GenerateCivilFile(1, claims1.length, format, {
        claims: claims1,
        office: officeUsed
    });
    const firstFile = gen1.filePaths[0];
    injectSubmissionPeriod(firstFile, period1);
    await GenerateCivilFilesOverrideForPath(firstFile, claims1);

    const gen2 = await GenerateCivilFile(1, claims2.length, format, {
        claims: claims2,
        office: officeUsed
    });
    const secondFile = gen2.filePaths[0];
    injectSubmissionPeriod(secondFile, period2);
    await GenerateCivilFilesOverrideForPath(secondFile, claims2);

    return {
        firstFile,
        secondFile,
        officeUsed,
        period1,
        period2,
        cutoffDate: duplicateDates.cutoffDate,
        firstCcd: duplicateDates.firstWorkConcludedDate,
        secondCcd: duplicateDates.secondWorkConcludedDate
    };
}