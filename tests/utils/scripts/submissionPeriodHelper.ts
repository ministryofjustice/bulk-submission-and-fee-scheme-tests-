import fs from 'fs';
import os from 'os';
import path from 'path';
import { faker } from '@faker-js/faker';
import { createDataSourceManager } from '../db/dataSourceManager';

// ---------- 🧠 Helper Cache Setup ----------
function getCacheFile(areaOfLaw: string): string {
  const safeArea = areaOfLaw.toLowerCase().replace(/\s+/g, '_');
  return path.join(os.tmpdir(), `${safeArea}_used_submission_periods.json`);
}

function readUsedPeriods(areaOfLaw: string): string[] {
  const file = getCacheFile(areaOfLaw);
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify([]), 'utf-8');
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) || [];
  } catch {
    return [];
  }
}

function writeUsedPeriods(areaOfLaw: string, periods: string[]) {
  const file = getCacheFile(areaOfLaw);
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(periods, null, 2), 'utf-8');
  fs.renameSync(tmp, file);
  console.log(`✅ Updated used periods cache for ${areaOfLaw}: ${file}`);
}

// ---------- 🧩 Constants ----------
const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

// ---------- 🗄 DB Manager ----------
const submissionManager = createDataSourceManager({ label: 'submissionPeriodHelper' });

// ---------- 🔍 DB Query ----------
async function isSubmissionPeriodUsed(areaOfLaw: string, submissionPeriod: string, office: string): Promise<boolean> {
  const dataSource = submissionManager.getDataSource();
  if (!dataSource.isInitialized) return false;

  const result = await dataSource.query(
      `SELECT 1 
       FROM claims.submission 
      WHERE area_of_law = $1 
        AND submission_period = $2 
        AND office_account_number = $3 
        AND status = 'VALIDATION_SUCCEEDED'
      LIMIT 1`,
      [areaOfLaw, submissionPeriod, office]
  );
  return result.length > 0;
}

export function buildScheduleRef(
    office: string,
    submissionPeriod: string,
    areaOfLaw: string
): string {
  const [month, year] = submissionPeriod.split('-');
  const shortYear = year.slice(-2);

  let prefix: string;

  if (areaOfLaw.toUpperCase().includes('LEGAL')) {
    prefix = 'CIV';
  } else if (areaOfLaw.toUpperCase().includes('MEDI')) {
    prefix = 'MEDI';
  } else if (areaOfLaw.toUpperCase().includes('CRIME')) {
    prefix = 'CRM';
  } else {
    prefix = 'GEN'; // fallback for unknown areas
  }

  return `${office}/${prefix}${month.toUpperCase()}${shortYear}/01`;
}

// ---------- 🧮 Main Function ----------
export async function getUniqueSubmissionPeriod(
    office: string,
    areaOfLaw: string
): Promise<string> {
  const usedPeriods = readUsedPeriods(areaOfLaw);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Don’t use current month (submissions must be past)
  const endOfLastMonth = new Date(currentYear, currentMonth, 0);
  const startDate = new Date('2021-01-01');

  await submissionManager.ensureInitialized();

  for (let attempt = 0; attempt < 50; attempt++) {
    const submissionDate = faker.date.between({ from: startDate, to: endOfLastMonth });
    const month = MONTHS[submissionDate.getMonth()];
    const year = submissionDate.getFullYear();
    const period = `${month}-${year}`;
    const key = `${areaOfLaw}_${office}_${period}`;

    const alreadyUsed = usedPeriods.includes(key);
    const dbUsed = await isSubmissionPeriodUsed(areaOfLaw.toUpperCase(), period, office);

    if (alreadyUsed || dbUsed) continue;

    usedPeriods.push(key);
    writeUsedPeriods(areaOfLaw, usedPeriods);
    console.log(`🧩 Using new unique period for ${areaOfLaw}: ${period}`);
    return period;
  }

  throw new Error(`❌ Cannot find unique submission period for ${areaOfLaw} (${office})`);
}

// ---------- 🧹 Cleanup ----------
export async function destroySubmissionPeriodManager() {
  await submissionManager.destroy();
}

export function resetSubmissionPeriodCache(areaOfLaw: string) {
  const file = getCacheFile(areaOfLaw);
  if (fs.existsSync(file)) fs.unlinkSync(file);
  fs.writeFileSync(file, JSON.stringify([]), 'utf-8');
  console.log(`🧹 Reset submission period cache for ${areaOfLaw}: ${file}`);
}

export function getSubmissionPeriod(monthIncrement: string, isShort?: boolean) {
    const currentDate = new Date();
    const formatter = new Intl.DateTimeFormat('en-GB', { month: 'long' });
    isShort = isShort ?? true;
    let increment = 0;

    // @ts-ignore
    if (parseInt(monthIncrement) instanceof Number) {
        increment = parseInt(monthIncrement);
    } else {
        increment = parseInt(monthIncrement.split('+')[1]);
    }
    // adjust the date to the new month and year
    currentDate.setMonth( currentDate.getMonth() + increment, currentDate.getDate())

    const glue = isShort ? '-' : ' ';
    const month = isShort? MONTHS[currentDate.getMonth()]
    : formatter.format(currentDate);

    return `${month}${glue}${currentDate.getFullYear()}`;
}
