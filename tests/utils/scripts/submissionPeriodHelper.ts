import { createDataSourceManager } from '../db/dataSourceManager';

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

const submissionManager = createDataSourceManager({ label: 'submissionPeriodHelper' });
const usedPeriods = new Map<string, Set<string>>();
const usedScheduleRefs = new Set<string>();

const createRandomIndices = (length: number): number[] => {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
};

export async function getUniqueSubmissionPeriod(
  account: string,
  dbAreaOfLaw: string
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
           AND office_account_number = $3
         LIMIT 1`,
        [dbAreaOfLaw, candidate, accountKey]
      );
      if (Array.isArray(rows) && rows.length > 0) {
        continue;
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
