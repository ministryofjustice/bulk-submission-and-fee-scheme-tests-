import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { faker } from '@faker-js/faker';
import 'reflect-metadata';
import dotenv from 'dotenv';
import { convertFileToXml } from './converter';
import { getUniqueSubmissionPeriod } from './submissionPeriodHelper';
import { claimOptions } from './claimOptions';
import { GenerateFileOptions } from './generateFileOptions';

dotenv.config();

const AREA_OF_LAW = 'MEDIATION';

// ---------- 1️⃣ Database Setup ----------
let providerApiAvailable = true;

// ---------- 2️⃣ Config ----------
const offices = ['0P322F', '1T102C', '2L848R'];
const feeCodes = ['ASSA'];
const OUTPUT_DIR = 'generated_submissions_mediation';

// ---------- 3️⃣ Helpers ----------
const pad = (num: number, len = 2) => num.toString().padStart(len, '0');
const randomFrom = <T>(arr: T[]): T =>
    arr[Math.floor(Math.random() * arr.length)];
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

// ---------- 4️⃣ Outcome Generator (respects schedule bounds) ----------
const generateOutcome = async (
    office: string,
    caseNum: number,
    scheduleStart?: string,
    scheduleEnd?: string
) => {
  const client1First = faker.person.firstName();
  const client1Last = faker.person.lastName();
  const client2First = faker.person.firstName();
  const client2Last = faker.person.lastName();
  const dob1 = faker.date.between({ from: new Date('1950-01-01'), to: new Date('2000-12-31') });
  const dob2 = faker.date.between({ from: new Date('1950-01-01'), to: new Date('2000-12-31') });

  // Respect provider contract window
  const startBound = scheduleStart ? new Date(scheduleStart) : new Date('2015-05-01');
  const endBound = scheduleEnd ? new Date(scheduleEnd) : new Date('2025-10-31');
  const caseStartDate = faker.date.between({ from: startBound, to: endBound });

  const medConcluded = faker.date.between({ from: caseStartDate, to: endBound });
  const workConcluded = faker.date.between({ from: caseStartDate, to: medConcluded });
  const ufn = generateUFN(caseStartDate, caseNum);

  // Generate valid UCNs
  const ucn1 = `${pad(dob1.getDate())}${pad(dob1.getMonth() + 1)}${dob1.getFullYear()}/${client1Last[0].toUpperCase()}/${sanitizeForCode(client1Last).slice(0, 4)}`;
  const ucn2 = `${pad(dob2.getDate())}${pad(dob2.getMonth() + 1)}${dob2.getFullYear()}/${client2Last[0].toUpperCase()}/${sanitizeForCode(client2Last).slice(0, 4)}`;

  // @ts-ignore
  return {
    case_ref_number: faker.number.int({ min: 1000, max: 9999 }),
    case_start_date: formatDate(caseStartDate),
    case_id: pad(caseNum, 3),
    ufn,
    client1_first: client1First,
    client1_last: client1Last,
    client1_dob: formatDate(dob1),
    client1_gender: randomFrom(['M', 'F']),
    client1_ethnicity: '01',
    client1_disability: randomFrom(['NCD', 'ILL']),
    client1_postcode: faker.helpers.replaceSymbols('??## #??').toUpperCase(),
    client1_legally_aided: randomFrom(['Y', 'N']),
    client2_first: client2First,
    client2_last: client2Last,
    client2_dob: formatDate(dob2),
    client2_gender: randomFrom(['M', 'F']),
    client2_ethnicity: '01',
    client2_disability: randomFrom(['NCD', 'ILL']),
    client2_postcode: faker.helpers.replaceSymbols('??## #??').toUpperCase(),
    client2_legally_aided: randomFrom(['Y', 'N']),
    med_concluded_date: formatDate(medConcluded),
    work_concluded_date: formatDate(workConcluded),
    outcome_code: 'B',
    number_of_sessions: faker.number.int({ min: 1, max: 5 }),
    mediation_time: faker.number.int({ min: 60, max: 240 }),
    fee_code: randomFrom(feeCodes),
    ///@ts-ignore
    disbursements_amount: faker.finance.amount(0, 200, 2),
    ///@ts-ignore
    disbursements_vat: faker.finance.amount(0, 50, 2),
    vat_indicator: randomFrom(['Y', 'N']),
    unique_case_id: `${ufn}`,
    outreach: faker.helpers.arrayElement(['000', '001', '002']),
    referral: faker.helpers.arrayElement(['08', '09', '10']),
    ucn1,
    ucn2,
  };
};

// ---------- 5️⃣ File Generator ----------
const generateFile = async (
    fileName: string,
    outcomesCount: number,
    fileType: 'txt' | 'csv',
    options: GenerateFileOptions = {}
) => {
  const office = options?.office ?? randomFrom(offices);
  const { period, scheduleStart, scheduleEnd } = await getUniqueSubmissionPeriod(office, AREA_OF_LAW);

  // Safe schedule number
  const monthCode = period.slice(0, 3).toUpperCase();
  const yearCode = period.slice(-4).slice(-2);
  const scheduleNum = `${office}/MEDI${monthCode}${yearCode}/01`;

  let content = `OFFICE,account=${office}\n`;
  content += `SCHEDULE,submissionPeriod=${period},areaOfLaw=${AREA_OF_LAW},scheduleNum=${scheduleNum}\n`;

  for (let i = 0; i < outcomesCount; i++) {
    const o = await generateOutcome(office, i, scheduleStart, scheduleEnd);
    const claimOverride = options.claims?.[i];
    const feeCode = claimOverride?.feeCode ?? randomFrom(feeCodes);

    content += `OUTCOME,FEE_CODE=${feeCode},matterType=MEDI:MDCS,CASE_START_DATE=${o.case_start_date},CASE_ID=${o.case_id},UFN=${o.ufn},CLIENT_FORENAME=${o.client1_first},CLIENT_SURNAME=${o.client1_last},CLIENT_DATE_OF_BIRTH=${o.client1_dob},UCN=${o.ucn1},GENDER=${o.client1_gender},ETHNICITY=${o.client1_ethnicity},DISABILITY=${o.client1_disability},CLIENT_POST_CODE=${o.client1_postcode},CLIENT_LEGALLY_AIDED=${o.client1_legally_aided},CLIENT2_FORENAME=${o.client2_first},CLIENT2_SURNAME=${o.client2_last},CLIENT2_DATE_OF_BIRTH=${o.client2_dob},CLIENT2_UCN=${o.ucn2},CLIENT2_GENDER=${o.client2_gender},CLIENT2_ETHNICITY=${o.client2_ethnicity},CLIENT2_DISABILITY=${o.client2_disability},CLIENT2_POST_CODE=${o.client2_postcode},CLIENT2_LEGALLY_AIDED=${o.client2_legally_aided},MED_CONCLUDED_DATE=${o.med_concluded_date},WORK_CONCLUDED_DATE=${o.work_concluded_date},NUMBER_OF_MEDIATION_SESSIONS=${o.number_of_sessions},MEDIATION_TIME=${o.mediation_time},CASE_REF_NUMBER=${o.case_ref_number},OUTCOME_CODE=${o.outcome_code},DISBURSEMENTS_AMOUNT=${o.disbursements_amount},DISBURSEMENTS_VAT=${o.disbursements_vat},VAT_INDICATOR=${o.vat_indicator},UNIQUE_CASE_ID=${o.unique_case_id},OUTREACH=${o.outreach},REFERRAL=${o.referral},POSTAL_APPL_ACCP=Y,CLIENT2_POSTAL_APPL_ACCP=N,SCHEDULE_REF=${scheduleNum}\n`;
  }

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);
  fs.writeFileSync(path.join(OUTPUT_DIR, `${fileName}.${fileType}`), content, 'utf-8');
  console.log(`✅ Generated ${fileName}.${fileType} for ${office} (${scheduleStart} → ${scheduleEnd})`);
};

// ---------- 6️⃣ Public Export ----------
export async function GenerateMediationFiles(
    files: number,
    outcomes: number,
    format: 'txt' | 'csv' | 'xml',
    options: GenerateFileOptions = {}
): Promise<{ filePaths: string[]; office: string }> {
  const generatedFiles: string[] = [];
  const officeInput = options.office ?? randomFrom(offices);

  try {
    for (let i = 1; i <= files; i++) {
      const uniquePart = options.suffix || `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const baseName = `mediation_${uniquePart}_${i}`;
      const intermediateFormat = format === 'xml' ? 'csv' : format;

      await generateFile(baseName, outcomes, intermediateFormat, { ...options, office: officeInput });
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

    console.log(`🎉 Mediation files ready for ${officeInput}`);
    return { filePaths: generatedFiles, office: officeInput };
  } catch (err) {
    console.error('❌ Error generating Mediation files:', err);
    throw err;
  }
}
