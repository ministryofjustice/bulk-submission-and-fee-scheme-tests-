import { getUniqueSubmissionPeriod } from './submissionPeriodHelper';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { faker } from '@faker-js/faker';
import { convertFileToXml } from './converter';
import 'reflect-metadata';
import dotenv from 'dotenv';
import { claimOptions } from './claimOptions';
import { GenerateFileOptions } from './generateFileOptions';

dotenv.config();

// ---------- 1️⃣ Provider API ----------
let providerApiAvailable = true;

// ---------- 2️⃣ Config ----------
const offices = ['0P322F', '2L847Q', '2N199K', '2P746R', '1T102C'];
const feeCodes = ['CAPA', 'COM'];
const OUTPUT_DIR = 'generated_submissions_legal';
const PROVIDER_API =
    process.env.PROVIDER_API ||
    'https://laa-provider-details-api-uat.apps.live.cloud-platform.service.justice.gov.uk/api/v1/provider-offices';

// ---------- 3️⃣ Helpers ----------
const pad = (num: number, len = 2) => num.toString().padStart(len, '0');
const randomFrom = <T>(arr: T[]): T =>
    arr[Math.floor(Math.random() * arr.length)];
const randomMoney = (min: number, max: number) =>
    faker.number.float({ min, max, fractionDigits: 2 });
const formatDate = (date: Date) =>
    date.toISOString().split('T')[0].split('-').reverse().join('/');
const sanitizeForCode = (str: string) =>
    str.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

const generateUFN = (date: Date, caseNum: number) => {
  const dd = pad(date.getDate());
  const mm = pad(date.getMonth() + 1);
  const yy = String(date.getFullYear()).slice(-2);
  const nnn = pad(caseNum, 3);
  return `${dd}${mm}${yy}/${nnn}`;
};

const generateUCN = (dob: Date, surname: string, initial: string) => {
  const dd = pad(dob.getDate());
  const mm = pad(dob.getMonth() + 1);
  const yyyy = dob.getFullYear();
  return `${dd}${mm}${yyyy}/${initial}/${sanitizeForCode(
      surname.slice(0, 3)
  )}`;
};

// ---------- 4️⃣ Outcome Generator (FULLY FIXED & VALID) ----------
const generateOutcome = async (
    office: string,
    caseNum: number,
    scheduleStart?: string,
    scheduleEnd?: string
) => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  // Birth date constraint
  const dob = faker.date.between({
    from: new Date('1960-01-01'),
    to: new Date('2005-12-31')
  });

  // ---------- FIXED DATE RANGE LOGIC ----------
  // Provider schedule range (if provided)
  let rangeStart = scheduleStart ? new Date(scheduleStart) : new Date('1995-01-01');
  let rangeEnd = scheduleEnd ? new Date(scheduleEnd) : new Date();

  // Global rules: must be 1995 → today
  const GLOBAL_MIN = new Date('1995-01-01');
  const today = new Date();

  if (rangeStart < GLOBAL_MIN) rangeStart = GLOBAL_MIN;
  if (rangeEnd > today) rangeEnd = today;

  // Ensure valid chronological order
  if (rangeEnd <= rangeStart) {
    rangeEnd = new Date(rangeStart);
    rangeEnd.setMonth(rangeEnd.getMonth() + 1);
    if (rangeEnd > today) rangeEnd = today;
  }

  // Generate valid case start date
  const caseStartDate = faker.date.between({
    from: rangeStart,
    to: rangeEnd
  });

  // Generate valid work concluded date
  const workConcludedDate = faker.date.between({
    from: caseStartDate,
    to: rangeEnd
  });

  const ufn = generateUFN(caseStartDate, caseNum);
  const ucn = generateUCN(dob, lastName, firstName[0]);
  const postcode = faker.helpers.replaceSymbols('??## #??').toUpperCase();

  return {
    case_ref_number: `${sanitizeForCode(firstName.slice(0, 3))}/${sanitizeForCode(lastName)}`,
    case_start_date: formatDate(caseStartDate),
    case_id: pad(caseNum, 3),
    ufn,
    client_forename: firstName,
    client_surname: lastName,
    client_date_of_birth: formatDate(dob),
    ucn,
    gender: randomFrom(['M', 'F']),
    ethnicity: '12',
    disability: 'NCD',
    profit_cost: randomMoney(50, 200),
    disbursements_amount: randomMoney(0, 20),
    disbursements_vat: randomMoney(0, 1.98),
    counsel_cost: randomMoney(0, 50),
    travel_costs: randomMoney(0, 15),
    work_concluded_date: formatDate(workConcludedDate),
    advice_time: 120,
    travel_time: 0,
    waiting_time: 0,
    vat_indicator: 'Y',
    london_nonlondon_rate: 'N',
    outcome_code: 'FX',
    schedule_ref: `${office}/${new Date().getFullYear()}/${caseNum}`,
    client_post_code: postcode
  };
};

// ---------- 5️⃣ Ensure output dir ----------
const ensureOutputDir = () => {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
};

// ---------- 6️⃣ File Generator ----------
const generateFile = async (
    baseName: string,
    outcomesCount: number,
    fileType: 'txt' | 'csv',
    office: string,
    claims?: claimOptions[]
) => {
  const { period, scheduleStart, scheduleEnd } = await getUniqueSubmissionPeriod(
      office,
      'LEGAL HELP'
  );

  const submissionPeriod = period;

  let content = `OFFICE,account=${office}\n`;
  content += `SCHEDULE,submissionPeriod=${submissionPeriod},areaOfLaw=LEGAL HELP,scheduleNum=${office}/CIVIL\n`;

  for (let i = 0; i < outcomesCount; i++) {
    const o = await generateOutcome(office, i, scheduleStart, scheduleEnd);

    const claimOverride = claims?.[i];
    const feeCode = claimOverride?.feeCode ?? randomFrom(feeCodes);
    const ucn = (claimOverride?.ucn ?? o.ucn).toUpperCase();
    const ufn = claimOverride?.ufn ?? o.ufn;
    const profitCost = claimOverride?.profitCost ?? o.profit_cost;
    const londonNonLondonRate =
        claimOverride?.londonNonLondonRate ?? o.london_nonlondon_rate;

    content += `OUTCOME,FEE_CODE=${feeCode},matterType=FAMX:FAPP,CASE_REF_NUMBER=${o.case_ref_number},CASE_START_DATE=${o.case_start_date},CASE_ID=${o.case_id},UFN=${ufn},PROCUREMENT_AREA=PA00120,ACCESS_POINT=AP00000,CLIENT_FORENAME=${o.client_forename},CLIENT_SURNAME=${o.client_surname},CLIENT_DATE_OF_BIRTH=${o.client_date_of_birth},UCN=${ucn},GENDER=${o.gender},ETHNICITY=${o.ethnicity},DISABILITY=${o.disability},CLIENT_POST_CODE=${o.client_post_code},WORK_CONCLUDED_DATE=${o.work_concluded_date},CASE_STAGE_LEVEL=FPC01,ADVICE_TIME=${o.advice_time},TRAVEL_TIME=${o.travel_time},WAITING_TIME=${o.waiting_time},PROFIT_COST=${profitCost},DISBURSEMENTS_AMOUNT=${o.disbursements_amount},COUNSEL_COST=${o.counsel_cost},DISBURSEMENTS_VAT=${o.disbursements_vat},TRAVEL_WAITING_COSTS=0.00,VAT_INDICATOR=${o.vat_indicator},LONDON_NONLONDON_RATE=${londonNonLondonRate},TRAVEL_COSTS=${o.travel_costs},OUTCOME_CODE=${o.outcome_code},POSTAL_APPL_ACCP=N,SCHEDULE_REF=${o.schedule_ref}\n`;
  }

  ensureOutputDir();
  fs.writeFileSync(path.join(OUTPUT_DIR, `${baseName}.${fileType}`), content, 'utf-8');

  console.log(
      `✅ Generated ${baseName}.${fileType} (${outcomesCount} outcomes) for ${office} (${scheduleStart} → ${scheduleEnd})`
  );
};

// ---------- 7️⃣ Public Export ----------
export async function GenerateCivilFile(
    files: number,
    outcomes: number,
    format: 'txt' | 'csv' | 'xml',
    options: GenerateFileOptions = {}
): Promise<{ filePaths: string[]; office: string }> {
  const generatedFiles: string[] = [];
  const { office, claims, suffix } = options;
  const officeInput = office ?? randomFrom(offices);

  try {
    for (let i = 1; i <= files; i++) {
      const baseName = `legal_${suffix || Date.now()}_${i}`;
      const intermediateFormat = format === 'xml' ? 'csv' : format;

      await generateFile(baseName, outcomes, intermediateFormat, officeInput, claims);

      const inputFile = path.join(OUTPUT_DIR, `${baseName}.${intermediateFormat}`);
      const outputFile = path.join(OUTPUT_DIR, `${baseName}.xml`);

      if (format === 'xml') {
        await convertFileToXml(inputFile, outputFile);
        fs.unlinkSync(inputFile);
        generatedFiles.push(outputFile);
      } else {
        generatedFiles.push(inputFile);
      }
    }

    console.log(`🎉 Legal Help files ready for ${officeInput}`);
    return { filePaths: generatedFiles, office: officeInput };
  } catch (err) {
    console.error('❌ Error generating Legal Help files:', err);
    throw err;
  }
}
