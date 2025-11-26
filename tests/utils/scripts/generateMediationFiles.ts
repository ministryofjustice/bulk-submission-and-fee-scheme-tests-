import fs from 'fs';
import path from 'path';
import { faker } from '@faker-js/faker';
import 'reflect-metadata';
import dotenv from 'dotenv';
import { convertFileToXml } from './converter';
import { getUniqueSubmissionPeriod } from './submissionPeriodHelper';
import { claimOptions } from './claimOptions';
import { GenerateFileOptions } from './generateFileOptions';

dotenv.config();

const AREA_OF_LAW = 'MEDIATION';

// ------------------------------
// 1️⃣ Config
// ------------------------------
const offices = ['0P322F', '1T102C', '2L848R'];
const feeCodes = ['ASSA'];
const OUTPUT_DIR = 'generated_submissions_mediation';

const pad = (n: number, len = 2) => n.toString().padStart(len, '0');
const randomFrom = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const formatDate = (d: Date) => d.toISOString().split('T')[0].split('-').reverse().join('/');
const clean = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

const generateUFN = (d: Date, caseNum: number) =>
    `${pad(d.getDate())}${pad(d.getMonth() + 1)}${String(d.getFullYear()).slice(-2)}/${pad(caseNum, 3)}`;

// ------------------------------
// 2️⃣ Outcome Generator
// ------------------------------
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

  const start = scheduleStart ? new Date(scheduleStart) : new Date('2015-05-01');
  const end = scheduleEnd ? new Date(scheduleEnd) : new Date('2025-10-31');

  const caseStartDate = faker.date.between({ from: start, to: end });
  const medConcluded = faker.date.between({ from: caseStartDate, to: end });
  const workConcluded = faker.date.between({ from: caseStartDate, to: medConcluded });

  const ufn = generateUFN(caseStartDate, caseNum);

  const ucn1 = `${pad(dob1.getDate())}${pad(dob1.getMonth() + 1)}${dob1.getFullYear()}/${client1Last[0].toUpperCase()}/${clean(client1Last).slice(0, 4)}`;
  const ucn2 = `${pad(dob2.getDate())}${pad(dob2.getMonth() + 1)}${dob2.getFullYear()}/${client2Last[0].toUpperCase()}/${clean(client2Last).slice(0, 4)}`;

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
    disbursements_amount: faker.number.float({ min: 0, max: 200, fractionDigits: 2 }),
    disbursements_vat: faker.number.float({ min: 0, max: 50, fractionDigits: 2 }),
    vat_indicator: randomFrom(['Y', 'N']),
    unique_case_id: `${ufn}`,
    outreach: faker.helpers.arrayElement(['000', '001', '002']),
    referral: faker.helpers.arrayElement(['08', '09', '10']),
    ucn1,
    ucn2,
  };
};

// ------------------------------
// 3️⃣ File Generator (★ now supports overrides properly)
// ------------------------------
const generateFile = async (
    fileName: string,
    outcomesCount: number,
    fileType: 'csv' | 'txt',
    options: GenerateFileOptions = {}
) => {
  const office = options.office ?? randomFrom(offices);

  const { period, scheduleStart, scheduleEnd } = await getUniqueSubmissionPeriod(
      office,
      AREA_OF_LAW
  );

  const mon = period.slice(0, 3).toUpperCase();
  const yr = period.slice(-2);
  const scheduleNum = `${office}/MEDI${mon}${yr}/01`;

  let content = `OFFICE,account=${office}\n`;
  content += `SCHEDULE,submissionPeriod=${period},areaOfLaw=${AREA_OF_LAW},scheduleNum=${scheduleNum}\n`;

  for (let i = 0; i < outcomesCount; i++) {
    const o = await generateOutcome(office, i, scheduleStart, scheduleEnd);

    const override = options.claims?.[i];

    const feeCode = override?.feeCode ?? o.fee_code;
    const ufn = override?.ufn ?? o.ufn;

    // NEW — override UCN for both clients
    const ucn1 = override?.ucn ?? o.ucn1;
    const ucn2 = override?.ucn ?? o.ucn2;

    const disbAmt = override?.disbursementAmount ?? o.disbursements_amount;
    // @ts-ignore
    const disbVat = override?.disbursementVat ?? o.disbursements_vat;
    // @ts-ignore
    const oc = override?.outcomeCode ?? o.outcome_code;
    // @ts-ignore
    const sessions = override?.sessions ?? o.number_of_sessions;

    content +=
        `OUTCOME,` +
        `FEE_CODE=${feeCode},` +
        `matterType=MEDI:MDCS,` +
        `CASE_START_DATE=${o.case_start_date},` +
        `CASE_ID=${o.case_id},` +
        `UFN=${ufn},` +
        `CLIENT_FORENAME=${o.client1_first},` +
        `CLIENT_SURNAME=${o.client1_last},` +
        `CLIENT_DATE_OF_BIRTH=${o.client1_dob},` +
        `UCN=${ucn1},` +
        `GENDER=${o.client1_gender},` +
        `ETHNICITY=${o.client1_ethnicity},` +
        `DISABILITY=${o.client1_disability},` +
        `CLIENT_POST_CODE=${o.client1_postcode},` +
        `CLIENT_LEGALLY_AIDED=${o.client1_legally_aided},` +
        `CLIENT2_FORENAME=${o.client2_first},` +
        `CLIENT2_SURNAME=${o.client2_last},` +
        `CLIENT2_DATE_OF_BIRTH=${o.client2_dob},` +
        `CLIENT2_UCN=${ucn2},` +
        `CLIENT2_GENDER=${o.client2_gender},` +
        `CLIENT2_ETHNICITY=${o.client2_ethnicity},` +
        `CLIENT2_DISABILITY=${o.client2_disability},` +
        `CLIENT2_POST_CODE=${o.client2_postcode},` +
        `CLIENT2_LEGALLY_AIDED=${o.client2_legally_aided},` +
        `MED_CONCLUDED_DATE=${o.med_concluded_date},` +
        `WORK_CONCLUDED_DATE=${o.work_concluded_date},` +
        `NUMBER_OF_MEDIATION_SESSIONS=${sessions},` +
        `MEDIATION_TIME=${o.mediation_time},` +
        `CASE_REF_NUMBER=${o.case_ref_number},` +
        `OUTCOME_CODE=${oc},` +
        `DISBURSEMENTS_AMOUNT=${disbAmt},` +
        `DISBURSEMENTS_VAT=${disbVat},` +
        `VAT_INDICATOR=${o.vat_indicator},` +
        `UNIQUE_CASE_ID=${o.unique_case_id},` +
        `OUTREACH=${o.outreach},` +
        `REFERRAL=${o.referral},` +
        `POSTAL_APPL_ACCP=Y,` +
        `CLIENT2_POSTAL_APPL_ACCP=N,` +
        `SCHEDULE_REF=${scheduleNum}\n`;
  }

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);
  fs.writeFileSync(path.join(OUTPUT_DIR, `${fileName}.${fileType}`), content, 'utf-8');
};

// ------------------------------
// 4️⃣ Public Export
// ------------------------------
export async function GenerateMediationFiles(
    files: number,
    outcomes: number,
    format: 'txt' | 'csv' | 'xml',
    options: GenerateFileOptions = {}
): Promise<{ filePaths: string[]; office: string }> {
  const filePaths: string[] = [];
  const officeInput = options.office ?? randomFrom(offices);

  for (let i = 1; i <= files; i++) {
    const suffix = options.suffix ?? `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const baseName = `mediation_${suffix}_${i}`;
    const intermediate = format === 'xml' ? 'csv' : format;

    await generateFile(baseName, outcomes, intermediate, {
      ...options,
      office: officeInput,
    });

    const input = path.join(OUTPUT_DIR, `${baseName}.${intermediate}`);
    const xmlOutput = path.join(OUTPUT_DIR, `${baseName}.xml`);

    if (format === 'xml') {
      await convertFileToXml(input, xmlOutput);
      fs.unlinkSync(input);
      filePaths.push(xmlOutput);
    } else {
      filePaths.push(input);
    }
  }

  return { filePaths, office: officeInput };
}
