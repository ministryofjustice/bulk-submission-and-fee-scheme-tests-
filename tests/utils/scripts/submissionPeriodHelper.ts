import {createDataSourceManager} from '../db/dataSourceManager';
import axios from 'axios';
import dotenv from "dotenv";

dotenv.config();

// ===== PDA API state =====

const pdaHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};
const pdaToken = process.env.PDA_API_TOKEN;

if (pdaToken) pdaHeaders['X-Authorization'] = pdaToken;
const pdaClient = axios.create({
  baseURL: process.env.PDA_API_BASE_URL,
  timeout: 10000,
  headers: pdaHeaders,
  validateStatus: () => true, // allow manual status inspection
});

const MONTHS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];

const allowedPeriods: string[] = (() => {
  const periods: string[] = [];
  const startYear = 2021;
  const startMonth = 0;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let endYear = currentYear;
  let endMonth = currentMonth - 1;
  if (endMonth < 0) {
    endYear -= 1;
    endMonth = 11;
  }

  for (let year = startYear; year <= endYear; year++) {
    const monthStart = year === startYear ? startMonth : 0;
    const monthEnd = year === endYear ? endMonth : 11;
    for (let month = monthStart; month <= monthEnd; month++) {
      periods.push(`${MONTHS[month]}-${year}`);
    }
  }

  return periods;
})();

const submissionManager = createDataSourceManager({label: 'submissionPeriodHelper'});
const usedPeriods = new Map<string, Set<string>>();
const usedScheduleRefs = new Set<string>();

const createRandomIndices = (length: number): number[] => {
  const indices = Array.from({length}, (_, i) => i);
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
};


export async function getUniqueSubmissionPeriod(
    account: string,
    dbAreaOfLaw: string,
    feeCode: string | undefined = undefined
): Promise<string> {
  if (allowedPeriods.length === 0) {
    throw new Error('No allowed submission periods available.');
  }

  const accountKey = account.trim();
  if (!usedPeriods.has(accountKey)) {
    usedPeriods.set(accountKey, new Set());
  }
  const cache = usedPeriods.get(accountKey)!;

  const randomizedIndices = createRandomIndices(allowedPeriods.length);
  const hasDb = await submissionManager.ensureInitialized();
  const dataSource = submissionManager.getDataSource();

  for (const index of randomizedIndices) {
    const candidate = allowedPeriods[index];
    if (cache.has(candidate)) continue;

    if (hasDb) {
      const rows = await dataSource.query(
          `SELECT 1
           FROM claims.submission
           WHERE area_of_law = $1
             AND submission_period = $2
             AND office_account_number = $3 LIMIT 1`,
          [dbAreaOfLaw, candidate, accountKey]
      );
      if (Array.isArray(rows) && rows.length > 0) {
        continue;
      }

      // Only check for fee code if it's not undefined
      if (feeCode !== undefined) {

        // Convert MMM-YYYY to DD-MM-YYYY format
        const [month, year] = candidate.split('-');
        const monthIndex = MONTHS.indexOf(month);
        const formattedDate = `01-${(monthIndex + 1).toString().padStart(2, '0')}-${year}`;

        // Check if submission period is within contract
        const resp = await pdaClient
        .get(`/api/v1/provider-offices/${accountKey}/schedules` +
            `?areaOfLaw=${dbAreaOfLaw}&effectiveDate=${formattedDate}`);

        const schedules = resp.data.schedules ?? [];

        if (schedules.length === 0) {
          console.log(`No contact found for ${feeCode} within ${dbAreaOfLaw} in ${formattedDate}`);
          continue;
        }

        const firstSchedule = schedules[0];

        const startDate = firstSchedule.scheduleStartDate;
        const endDate = firstSchedule.scheduleEndDate;

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Check if candidate date is within contract period
        const candidateDate = new Date(parseInt(year), monthIndex, 1);
        if (candidateDate < start || candidateDate > end) {
          console.log(`Submission period ${candidate} is outside contract period ${startDate} to ${endDate}`);
          continue;
        }
      }
    }

    cache.add(candidate);
    return candidate;
  }

  throw new Error(`Unable to generate unique submission period for account ${accountKey}`);
}

export function generateScheduleRef(account: string): string {
  const sanitizedAccount = account.trim();
  const year = new Date().getFullYear();
  let candidate: string;

  do {
    const suffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    candidate = `${sanitizedAccount}/${year}/${suffix}`;
  } while (usedScheduleRefs.has(candidate));

  usedScheduleRefs.add(candidate);
  return candidate;
}

export async function destroySubmissionPeriodManager() {
  await submissionManager.destroy();
}

export function resetSubmissionPeriodCache() {
  usedPeriods.clear();
  usedScheduleRefs.clear();
}

export function getSubmissionPeriod(monthIncrement: string, isShort?: boolean) {
  const currentDate = new Date();
  const formatter = new Intl.DateTimeFormat('en-GB', {month: 'long'});
  isShort = isShort ?? true;
  let increment = 0;

  // @ts-ignore
  if (parseInt(monthIncrement) instanceof Number) {
    increment = parseInt(monthIncrement);
  } else {
    increment = parseInt(monthIncrement.split('+')[1]);
  }
  // adjust the date to the new month and year
  currentDate.setMonth(currentDate.getMonth() + increment, currentDate.getDate())

  const glue = isShort ? '-' : ' ';
  const month = isShort ? MONTHS[currentDate.getMonth()]
      : formatter.format(currentDate);

  return `${month}${glue}${currentDate.getFullYear()}`;
}
