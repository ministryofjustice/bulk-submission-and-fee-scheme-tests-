import { createDataSourceManager } from '../db/dataSourceManager';
import axios from 'axios';

const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];

// Build list of allowed submission periods (2015 → last full month)
const allowedPeriods: string[] = (() => {
  const periods: string[] = [];
  const startYear = 2015;
  const now = new Date();
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

// ✅ Shared cache for provider schedule lookups
const providerScheduleCache = new Map<string, any>();

// ───────────────────────────────────────────────
// Area-of-law normalisation
// ───────────────────────────────────────────────
const AREA_OF_LAW_DB_KEY: Record<string, string> = {
  'LEGAL HELP': 'LEGAL_HELP',
  'CRIME LOWER': 'CRIME_LOWER',
  'MEDIATION': 'MEDIATION',
};

function normaliseProviderAreaOfLaw(areaOfLaw: string): string {
  // What we send to the provider API (e.g. "CRIME LOWER", "LEGAL HELP")
  return areaOfLaw.trim().toUpperCase();
}

function normaliseDbAreaOfLaw(areaOfLaw: string): string {
  // What we use in the DB (e.g. "LEGAL_HELP", "CRIME_LOWER")
  const key = areaOfLaw.trim().toUpperCase();
  return AREA_OF_LAW_DB_KEY[key] ?? key.replace(/\s+/g, '_');
}

// ───────────────────────────────────────────────
// Lock Helper (prevents race conditions)
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
// Provider Contract Check (returns schedule range)
// ───────────────────────────────────────────────
type ScheduleValidity = {
  valid: boolean;
  start?: string;
  end?: string;
};

async function hasValidContract(
    office: string,
    providerAreaOfLaw: string,
    period: string
): Promise<ScheduleValidity> {
  const cacheKey = `${office}_${providerAreaOfLaw}_${period}`;
  if (providerScheduleCache.has(cacheKey)) {
    return providerScheduleCache.get(cacheKey)!;
  }

  const [monthStr, yearStr] = period.split('-');
  const month = MONTHS.indexOf(monthStr.toUpperCase());
  if (month === -1) return { valid: false };

  const effectiveDate = new Date(parseInt(yearStr, 10), month, 15)
      .toISOString()
      .split('T')[0];

  const apiUrl =
      process.env.PROVIDER_API ||
      'https://laa-provider-details-api-uat.apps.live.cloud-platform.service.justice.gov.uk/api/v1/provider-offices';

  try {
    const res = await axios.get(
        `${apiUrl}/${office}/schedules?effectiveDate=${effectiveDate}&areaOfLaw=${encodeURIComponent(
            providerAreaOfLaw
        )}`,
        {
          headers: {
            accept: 'application/json',
            'X-Authorization':
                process.env.PROVIDER_API_KEY,
            ///@ts-ignore
            validateStatus: () => true,
            timeout: 8000,
          },
        }
    );

    if (!res.data?.schedules?.length) {
      providerScheduleCache.set(cacheKey, { valid: false });
      return { valid: false };
    }

    const match = res.data.schedules.find((s: any) => {
      const start = new Date(s.scheduleStartDate);
      const end = new Date(s.scheduleEndDate);
      const eff = new Date(effectiveDate);
      return eff >= start && eff <= end;
    });

    if (!match) {
      providerScheduleCache.set(cacheKey, { valid: false });
      return { valid: false };
    }

    const result = {
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
// 🎯 Get Unique Submission Period (+ schedule window)
// ───────────────────────────────────────────────
export async function getUniqueSubmissionPeriod(
    account: string,
    areaOfLaw: string
): Promise<{ period: string; scheduleStart?: string; scheduleEnd?: string }> {
  if (allowedPeriods.length === 0) {
    throw new Error('No allowed submission periods available.');
  }

  const accountKey = account.trim();

  const providerLawKey = normaliseProviderAreaOfLaw(areaOfLaw); // for API
  const dbLawKey = normaliseDbAreaOfLaw(areaOfLaw); // for DB
  const cacheKey = `${dbLawKey}_${accountKey}`;

  // 🔒 lock per office + DB area_of_law (prevents parallel reuse)
  const lockKey = `${dbLawKey}_${accountKey}_LOCK`;

  if (!usedPeriods.has(cacheKey)) usedPeriods.set(cacheKey, new Set());
  const cache = usedPeriods.get(cacheKey)!;

  return withLock(lockKey, async () => {
    const hasDb = await submissionManager.ensureInitialized();
    const dataSource = submissionManager.getDataSource();
    const randomized = [...allowedPeriods].reverse(); // newest → oldest

    const MAX_ATTEMPTS = 240;
    const MAX_DURATION_MS = 80_000;
    const startTime = Date.now();
    let attempts = 0;

    for (const candidate of randomized) {
      if (attempts++ >= MAX_ATTEMPTS) {
        throw new Error(
            `⏳ Tried ${MAX_ATTEMPTS} periods (${dbLawKey}/${accountKey}) — no valid contract found`
        );
      }
      if (Date.now() - startTime > MAX_DURATION_MS) {
        throw new Error(
            `⏱ Timed out after ${MAX_DURATION_MS / 1000}s trying to find submission period for ${dbLawKey}/${accountKey}`
        );
      }

      if (cache.has(candidate)) continue;

      // 🧩 Step 1: DB check — skip if already exists for that period
      if (hasDb && dataSource.isInitialized) {
        try {
          const rows = await dataSource.query(
              `SELECT 1
             FROM claims.submission
             WHERE area_of_law = $1
               AND submission_period = $2
               AND office_account_number = $3
             LIMIT 1`,
              [dbLawKey, candidate, accountKey]
          );
          if (Array.isArray(rows) && rows.length > 0) {
            console.log(`⛔ ${dbLawKey}: ${candidate} already exists for ${accountKey}`);
            continue;
          }
        } catch (err) {
          console.warn(
              `⚠️ DB query failed for ${dbLawKey}/${accountKey} (${candidate}):`,
              err
          );
        }
      }

      // 🧩 Step 2: Provider contract check (use provider value)
      const contract = await Promise.race([
        hasValidContract(accountKey, providerLawKey, candidate),
        new Promise<ScheduleValidity>((res) => setTimeout(() => res({ valid: false }), 3000)),
      ]);

      if (!contract.valid) {
        console.log(`⚠️ ${providerLawKey}: No provider contract for ${accountKey} in ${candidate}`);
        continue;
      }

      // 🧩 Step 3: Re-check DB to avoid race conditions
      if (hasDb && dataSource.isInitialized) {
        try {
          const rows = await dataSource.query(
              `SELECT 1
             FROM claims.submission
             WHERE area_of_law = $1
               AND submission_period = $2
               AND office_account_number = $3
             LIMIT 1`,
              [dbLawKey, candidate, accountKey]
          );

          if (Array.isArray(rows) && rows.length > 0) {
            console.log(
                `⛔ ${dbLawKey}: ${candidate} became unavailable for ${accountKey} (race condition avoided)`
            );
            continue; // try another period
          }
        } catch (err) {
          console.warn(
              `⚠️ Final DB cross-check failed for ${dbLawKey}/${accountKey} (${candidate}):`,
              err
          );
        }
      }

      // ✅ Step 4: All checks passed — assign period
      cache.add(candidate);
      console.log(
          `✅ ${providerLawKey}: Selected ${candidate} for ${accountKey} (Schedule: ${contract.start} → ${contract.end})`
      );
      return {
        period: candidate,
        scheduleStart: contract.start,
        scheduleEnd: contract.end,
      };
    }

    throw new Error(`❌ No available submission period for ${dbLawKey}/${accountKey}`);
  });
}

// ───────────────────────────────────────────────
// 🧾 Schedule Reference & Housekeeping
// ───────────────────────────────────────────────
const usedScheduleRefs = new Set<string>();

export function generateScheduleRef(account: string): string {
  const sanitizedAccount = account.trim();
  const year = new Date().getFullYear();
  let candidate: string;
  do {
    const suffix = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
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
  providerScheduleCache.clear();
  locks.clear();
  console.log('♻️ Submission period caches reset');
}

// ───────────────────────────────────────────────
// 🧮 Utility: Get Period X Months From Now
// ───────────────────────────────────────────────
export function getSubmissionPeriod(monthIncrement: string, isShort?: boolean) {
  const currentDate = new Date();
  const formatter = new Intl.DateTimeFormat('en-GB', { month: 'long' });
  isShort = isShort ?? true;
  const increment = parseInt(monthIncrement.replace('+', ''), 10) || 0;

  currentDate.setMonth(currentDate.getMonth() + increment, currentDate.getDate());
  const glue = isShort ? '-' : ' ';
  const month = isShort
      ? MONTHS[currentDate.getMonth()]
      : formatter.format(currentDate);

  return `${month}${glue}${currentDate.getFullYear()}`;
}

