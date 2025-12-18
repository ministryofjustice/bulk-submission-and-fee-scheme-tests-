import { createDataSourceManager } from '../../db/dataSourceManager';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// ───────────────────────────────────────────────
// 📅 Months + Allowed Periods (2015 → last full month)
// ───────────────────────────────────────────────
export const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

export const allowedPeriods: string[] = (() => {
  const periods: string[] = [];
  const startYear = 2015;
  const now = new Date();

  // last full month (so we don't use a partly-complete current month)
  let endYear = now.getFullYear();
  let endMonth = now.getMonth() - 1;
  if (endMonth < 0) {
    endYear -= 1;
    endMonth = 11;
  }

  for (let year = startYear; year <= endYear; year++) {
    const monthEnd = year === endYear ? endMonth : 11;
    for (let month = 0; month <= monthEnd; month++) {
      periods.push(`${MONTHS[month]}-${year}`);
    }
  }
  return periods;
})();

// ───────────────────────────────────────────────
// 🧩 Managers & Shared State
// ───────────────────────────────────────────────
const submissionManager = createDataSourceManager({ label: 'submissionPeriodHelper' });
const usedPeriods = new Map<string, Set<string>>();
const locks = new Map<string, Promise<void>>();
const providerScheduleCache = new Map<string, any>();
const usedScheduleRefs = new Set<string>();

// ───────────────────────────────────────────────
// 🔑 External API config (Provider schedules + FSP fee details)
// ───────────────────────────────────────────────
const PROVIDER_API_BASE_URL =
    process.env.PROVIDER_API ||
    'https://laa-provider-details-api-uat.apps.live.cloud-platform.service.justice.gov.uk/api/v1/provider-offices';

const fspHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

const fspToken = process.env.FSP_API_TOKEN;
if (fspToken) {
  fspHeaders['Authorization'] = fspToken;
}

const fspClient = axios.create({
  baseURL: process.env.FSP_API_BASE_URL,
  timeout: 10000,
  headers: fspHeaders,
  validateStatus: () => true,
});

// ───────────────────────────────────────────────
// AoL normalisation
// ───────────────────────────────────────────────
const AREA_OF_LAW_DB_KEY: Record<string, string> = {
  'LEGAL HELP': 'LEGAL_HELP',
  'CRIME LOWER': 'CRIME_LOWER',
  'MEDIATION': 'MEDIATION',
};

function normaliseProviderAreaOfLaw(areaOfLaw: string): string {
  return areaOfLaw.trim().toUpperCase();
}

function normaliseDbAreaOfLaw(areaOfLaw: string): string {
  const key = areaOfLaw.trim().toUpperCase();
  return AREA_OF_LAW_DB_KEY[key] ?? key.replace(/\s+/g, '_');
}

// ───────────────────────────────────────────────
// 🔒 Lock Helper
// ───────────────────────────────────────────────
async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(key);
  let resolve!: () => void;
  const current = new Promise<void>((r) => (resolve = r));
  const run = async () => {
    if (prev) await prev;
    try {
      return await fn();
    } finally {
      resolve();
      locks.delete(key);
    }
  };
  locks.set(key, current);
  return run();
}

// ───────────────────────────────────────────────
// 📑 Provider Contract Check (with schedule line matching)
// ───────────────────────────────────────────────
type ScheduleValidity = {
  valid: boolean;
  start?: string;
  end?: string;
};

export async function hasValidContract(
    office: string,
    providerAreaOfLaw: string,
    period: string,
    categoryOfLawCode?: string,
    isDisbursement?: boolean
): Promise<ScheduleValidity> {
  const cacheKey = `${office}_${providerAreaOfLaw}_${period}_${categoryOfLawCode ?? 'ANY'}`;
  if (providerScheduleCache.has(cacheKey)) {
    return providerScheduleCache.get(cacheKey)!;
  }

  const [monthStr, yearStr] = period.split('-');
  const month = MONTHS.indexOf(monthStr.toUpperCase());
  if (month === -1) return { valid: false };

  const effectiveDate = new Date(parseInt(yearStr, 10), month, 15)
      .toISOString().split('T')[0];

  try {
    const res = await axios.get(
        `${PROVIDER_API_BASE_URL}/${office}/schedules?effectiveDate=${effectiveDate}&areaOfLaw=${encodeURIComponent(providerAreaOfLaw)}`,
        {
          headers: {
            accept: 'application/json',
            'X-Authorization': process.env.PROVIDER_API_KEY ?? '',
          },
          timeout: 8000,
          validateStatus: () => true,
        }
    );

    const schedules = res.data?.schedules ?? [];
    if (!schedules.length) {
      providerScheduleCache.set(cacheKey, { valid: false });
      return { valid: false };
    }


    const effDate = new Date(effectiveDate);

    const match = schedules.find((s: any) => {
      const start = new Date(s.scheduleStartDate);
      const end = new Date(s.scheduleEndDate);
      const dateMatch = effDate >= start && effDate <= end;

      if (!categoryOfLawCode) return dateMatch;

      const catMatch =
          Array.isArray(s.scheduleLines) &&
          s.scheduleLines.some((line: any) => line.categoryOfLaw === categoryOfLawCode);

      return dateMatch && catMatch;
    });

    if (!match) {
      providerScheduleCache.set(cacheKey, { valid: false });
      return { valid: false };
    }

    // Return range
    const result: ScheduleValidity = {
      valid: true,
      start: match.scheduleStartDate,
      end: match.scheduleEndDate,
    };

    providerScheduleCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn(`⚠️ Provider API failed for ${office}/${period}:`, err);
    providerScheduleCache.set(cacheKey, { valid: false });
    return { valid: false };
  }
}

// ───────────────────────────────────────────────
// 🎯 MAIN ENTRY: Get Unique Submission Period
// ───────────────────────────────────────────────
export async function getUniqueSubmissionPeriod(
    account: string,
    areaOfLaw: string,
    feeCode?: string
): Promise<{ period: string; scheduleStart?: string; scheduleEnd?: string }> {
  if (!allowedPeriods.length) {
    throw new Error('No allowed submission periods available.');
  }

  const accountKey = account.trim();
  const providerLawKey = normaliseProviderAreaOfLaw(areaOfLaw);
  const dbLawKey = normaliseDbAreaOfLaw(areaOfLaw);

  // 🎯 FEE details → categoryOfLawCode
  let categoryOfLawCode: string | undefined;
  let isDisbursement = false;

  if (feeCode) {
    console.log(`🔎 Fetching fee details for ${feeCode}`);

    const feeDetailsResp = await fspClient.get(`/api/v1/fee-details/${feeCode}`);
    if (feeDetailsResp.status >= 400) {
      throw new Error(
          `Unable to resolve feeDetails for ${feeCode}: HTTP ${feeDetailsResp.status}`
      );
    }

    const fee = feeDetailsResp.data;
    categoryOfLawCode = fee.categoryOfLawCode;
    isDisbursement = fee.feeType === 'DISB_ONLY';
    console.log(`➡ categoryOfLaw=${categoryOfLawCode}, disbOnly=${isDisbursement}`);
  }

  // 🎯 **NEW** — cacheKey now includes categoryOfLawCode
  const catKey = categoryOfLawCode ?? 'ANY';
  const cacheKey = `${dbLawKey}_${accountKey}_${catKey}`;
  const lockKey = `${cacheKey}_LOCK`;

  if (!usedPeriods.has(cacheKey)) usedPeriods.set(cacheKey, new Set());
  const cache = usedPeriods.get(cacheKey)!;

  return withLock(lockKey, async () => {
    const hasDb = await submissionManager.ensureInitialized();
    const dataSource = submissionManager.getDataSource();

    const randomized = [...allowedPeriods].reverse(); // newest first

    for (const candidate of randomized) {
      if (cache.has(candidate)) continue;

      // DB check
      if (hasDb && dataSource.isInitialized) {
        try {
          const rows = await dataSource.query(
              `SELECT 1 FROM claims.submission
                         WHERE area_of_law = $1
                           AND submission_period = $2
                           AND office_account_number = $3
                         LIMIT 1`,
              [dbLawKey, candidate, accountKey]
          );
          if (rows?.length > 0) continue;
        } catch (e) {}
      }

      // Provider contract + schedule line validation
      const contract = await hasValidContract(
          accountKey,
          providerLawKey,
          candidate,
          categoryOfLawCode,
          isDisbursement
      );

      if (!contract.valid) continue;

      cache.add(candidate);
      console.log(`✅ Selected ${candidate} for ${cacheKey}`);
      return {
        period: candidate,
        scheduleStart: contract.start,
        scheduleEnd: contract.end,
      };
    }

    throw new Error(`❌ No available submission period for ${cacheKey}`);
  });
}

// ───────────────────────────────────────────────
// Utility functions
// ───────────────────────────────────────────────
export function generateScheduleRef(account: string): string {
  const sanitized = account.trim();
  const year = new Date().getFullYear();
  let candidate: string;
  do {
    const suffix = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
    candidate = `${sanitized}/${year}/${suffix}`;
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
  providerScheduleCache.clear();
  locks.clear();
}

export function getSubmissionPeriod(monthIncrement: string, isShort?: boolean) {
  const currentDate = new Date();
  const formatter = new Intl.DateTimeFormat('en-GB', { month: 'long' });
  isShort = isShort ?? true;
  const increment = parseInt(monthIncrement.replace('+', ''), 10) || 0;

  currentDate.setMonth(currentDate.getMonth() + increment);

  const glue = isShort ? '-' : ' ';
  const month = isShort
      ? MONTHS[currentDate.getMonth()]
      : formatter.format(currentDate);

  return `${month}${glue}${currentDate.getFullYear()}`;
}

export async function lockSpecificPeriod(
    account: string,
    areaOfLaw: string,
    period: string
): Promise<void> {
  const dbLawKey = normaliseDbAreaOfLaw(areaOfLaw);
  const accountKey = account.trim();
  const catKey = "ANY"; // unless you want feeCode support

  const cacheKey = `${dbLawKey}_${accountKey}_${catKey}`;
  const lockKey = `${cacheKey}_LOCK`;

  if (!usedPeriods.has(cacheKey)) {
    usedPeriods.set(cacheKey, new Set());
  }
  const cache = usedPeriods.get(cacheKey)!;

  // Acquire same lock used by getUniqueSubmissionPeriod
  await withLock(lockKey, async () => {
    // Ensure DB consistency
    const hasDb = await submissionManager.ensureInitialized();
    const dataSource = submissionManager.getDataSource();

    if (hasDb && dataSource.isInitialized) {
      const rows = await dataSource.query(
          `SELECT 1 FROM claims.submission
                 WHERE area_of_law = $1
                   AND submission_period = $2
                   AND office_account_number = $3
                 LIMIT 1`,
          [dbLawKey, period, accountKey]
      );

      if (rows.length > 0) {
        throw new Error(`Cannot lock period ${period} — already used in DB`);
      }
    }

    // Register in usedPeriods so no parallel test can reuse it
    cache.add(period);
  });
}
