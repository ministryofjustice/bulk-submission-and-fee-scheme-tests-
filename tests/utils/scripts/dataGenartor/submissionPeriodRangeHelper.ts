import { allowedPeriods, MONTHS, hasValidContract } from "./submissionPeriodHelper";
import { createDataSourceManager } from "../../db/dataSourceManager";

// Legal Help fallback offices
const LEGAL_HELP_OFFICES = ['0P322F', '2L847Q', '2N199K', '2P746R', '1T102C'];

/**
 * Returns two valid periods exactly N months apart.
 * Attempts scenario office first, then falls back to other Legal Help offices.
 */
export async function getTwoValidPeriodsApart(
    requestedOffice: string,
    areaOfLaw: string,
    monthsDiff: number
): Promise<{ officeUsed: string; period1: string; period2: string }> {

    const ds = createDataSourceManager({ label: "two_periods" });
    await ds.ensureInitialized();
    const db = ds.getDataSource();
    const dbArea = areaOfLaw.toUpperCase().replace(/\s+/g, "_");

    const officesToTry = [
        requestedOffice,
        ...LEGAL_HELP_OFFICES.filter(o => o !== requestedOffice)
    ];

    const candidates = [...allowedPeriods].reverse(); // newest → oldest

    for (const office of officesToTry) {

        for (const p1 of candidates) {
            if (!(await isPeriodValid(db, dbArea, office, areaOfLaw, p1))) continue;

            const p2 = shiftPeriod(p1, monthsDiff);
            if (!allowedPeriods.includes(p2)) continue;

            if (!(await isPeriodValid(db, dbArea, office, areaOfLaw, p2))) continue;

            return {
                officeUsed: office,
                period1: p1,
                period2: p2
            };
        }
    }

    throw new Error(
        `❌ Could not find two valid submission periods ${monthsDiff} months apart for ANY Legal Help office.`
    );
}

async function isPeriodValid(
    db: any,
    dbArea: string,
    office: string,
    areaOfLaw: string,
    period: string
): Promise<boolean> {

    // DB uniqueness check
    const rows = await db.query(
        `SELECT 1 FROM claims.submission
         WHERE submission_period = $1
           AND office_account_number = $2
           AND area_of_law = $3
         LIMIT 1`,
        [period, office, dbArea]
    );

    if (rows.length > 0) return false;

    // Provider schedule contract check
    const contract = await hasValidContract(office, areaOfLaw, period);
    return contract.valid;
}

export function shiftPeriod(period: string, diff: number): string {
    const [monStr, yearStr] = period.split("-");
    const idx = MONTHS.indexOf(monStr);
    const year = Number(yearStr);

    const d = new Date(year, idx, 1);
    d.setMonth(d.getMonth() + diff);

    return `${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
}
