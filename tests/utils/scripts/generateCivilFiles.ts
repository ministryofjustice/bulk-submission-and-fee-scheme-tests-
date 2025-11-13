import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { faker } from '@faker-js/faker';
import 'reflect-metadata';
import dotenv from 'dotenv';
import { convertFileToXml } from './converter';
import { getUniqueSubmissionPeriod, destroySubmissionPeriodManager } from './submissionPeriodHelper';
import { GenerateFileOptions } from './generateFileOptions';

dotenv.config();

const AREA_OF_LAW = 'LEGAL HELP';
let providerApiAvailable = true;

// ---------- Config ----------
const offices = ['0P322F'];
const feeCodes = ['CAPA', 'COM'];
const OUTPUT_DIR = 'generated_submissions_legal';
const PROVIDER_API =
    process.env.PROVIDER_API ||
    'https://laa-provider-details-api-uat.apps.live.cloud-platform.service.justice.gov.uk/api/v1/provider-offices';

// ---------- Helpers ----------
const pad = (n: number, len = 2) => n.toString().padStart(len, '0');
const randomFrom = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const randomMoney = (min: number, max: number) =>
    faker.number.float({ min, max, fractionDigits: 2 });
const formatDate = (d: Date) => d.toISOString().split('T')[0].split('-').reverse().join('/');
const sanitizeForCode = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

const generateUFN = (date: Date, caseNum: number) =>
    `${pad(date.getDate())}${pad(date.getMonth() + 1)}${String(date.getFullYear()).slice(-2)}/${pad(caseNum, 3)}`;

const generateUCN = (dob: Date, surname: string, initial: string) =>
    `${pad(dob.getDate())}${pad(dob.getMonth() + 1)}${dob.getFullYear()}/${initial}/${sanitizeForCode(surname.slice(0, 3))}`;

// ---------- Provider API ----------
const fetchProviderSchedules = async (office: string, date: Date) => {
  if (!providerApiAvailable) return undefined;
  try {
    const res = await axios.get(
        `${PROVIDER_API}/${office}/schedules?effectiveDate=${date.toISOString().split('T')[0]}&areaOfLaw=LEGAL%20HELP`,
        {
          headers: {
            accept: 'application/json',
            'X-Authorization': process.env.PROVIDER_API_KEY || 'dpd_e42*u+gb6@rp8qNmccvDUd',
          },
          validateStatus: () => true,
        }
    );
    if (res.status === 204) return [];
    return res.data.schedules;
  } catch (err) {
    providerApiAvailable = false;
    console.warn('⚠️ Unable to reach provider schedules API. Falling back to local date generation.');
    return undefined;
  }
};

// ---------- Outcome Generator ----------
const generateOutcome = async (office: string, caseNum: number, submissionYear: number) => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const dob = faker.date.between({ from: new Date('1960-01-01'), to: new Date('2005-12-31') });

  const minStart = new Date(Math.max(dob.getFullYear() + 18, 2018), 0, 1);
  const maxStart = new Date(2024, 11, 31);

  let caseStartDate: Date | null = null;
  for (let i = 0; i < 50; i++) {
    const candidate = faker.date.between({ from: minStart, to: maxStart });
    const schedules = await fetchProviderSchedules(office, candidate);
    if (schedules?.length) {
      const valid = schedules.find(
          (s: any) =>
              candidate >= new Date(s.scheduleStartDate) &&
              candidate <= new Date(s.scheduleEndDate)
      );
      if (valid) {
        caseStartDate = candidate;
        break;
      }
    }
    if (schedules === undefined) {
      caseStartDate = candidate;
      break;
    }
  }
  if (!caseStartDate) caseStartDate = faker.date.between({ from: minStart, to: maxStart });

  const workConcluded = faker.date.between({ from: caseStartDate, to: new Date() });
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
    work_concluded_date: formatDate(workConcluded),
    advice_time: 120,
    travel_time: 0,
    waiting_time: 0,
    vat_indicator: 'Y',
    london_nonlondon_rate: 'N',
    outcome_code: 'FX',
    schedule_ref: `${office}/${submissionYear}/${caseNum}`,
    client_post_code: postcode,
  };
};

// ---------- File Generator ----------
const generateFile = async (
    fileName: string,
    outcomesCount: number,
    fileType: 'txt' | 'csv',
    options: GenerateFileOptions = {}
) => {
  const office = options.office ?? randomFrom(offices);
  const submissionPeriod =
      options.submissionPeriod ?? (await getUniqueSubmissionPeriod(office, 'LEGAL_HELP'));
  const submissionYear = parseInt(submissionPeriod.split('-')[1], 10);

  let content = `OFFICE,account=${office}\n`;
  content += `SCHEDULE,submissionPeriod=${submissionPeriod},areaOfLaw=${AREA_OF_LAW},scheduleNum=${office}/CIVIL\n`;

  for (let i = 0; i < outcomesCount; i++) {
    const o = await generateOutcome(office, i, submissionYear);
    const feeCode = randomFrom(feeCodes);

    content += `OUTCOME,FEE_CODE=${feeCode},matterType=FAMX:FAPP,CASE_REF_NUMBER=${o.case_ref_number},CASE_START_DATE=${o.case_start_date},CASE_ID=${o.case_id},UFN=${o.ufn},PROCUREMENT_AREA=PA00120,ACCESS_POINT=AP00000,CLIENT_FORENAME=${o.client_forename},CLIENT_SURNAME=${o.client_surname},CLIENT_DATE_OF_BIRTH=${o.client_date_of_birth},UCN=${o.ucn},GENDER=${o.gender},ETHNICITY=${o.ethnicity},DISABILITY=${o.disability},CLIENT_POST_CODE=${o.client_post_code},WORK_CONCLUDED_DATE=${o.work_concluded_date},CASE_STAGE_LEVEL=FPC01,ADVICE_TIME=${o.advice_time},TRAVEL_TIME=${o.travel_time},WAITING_TIME=${o.waiting_time},PROFIT_COST=${o.profit_cost},DISBURSEMENTS_AMOUNT=${o.disbursements_amount},COUNSEL_COST=${o.counsel_cost},DISBURSEMENTS_VAT=${o.disbursements_vat},TRAVEL_WAITING_COSTS=0.00,VAT_INDICATOR=${o.vat_indicator},LONDON_NONLONDON_RATE=${o.london_nonlondon_rate},TRAVEL_COSTS=${o.travel_costs},OUTCOME_CODE=${o.outcome_code},POSTAL_APPL_ACCP=N,SCHEDULE_REF=${o.schedule_ref}\n`;
  }

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUTPUT_DIR, `${fileName}.${fileType}`), content, 'utf-8');
  console.log(`✅ Generated ${fileName}.${fileType} (${outcomesCount} outcomes)`);
};

// ---------- Public Export ----------
export async function GenerateCivilFile(
    files: number,
    outcomes: number,
    format: 'txt' | 'csv' | 'xml',
    options: GenerateFileOptions = {}
): Promise<string[]> {
  const results: string[] = [];

  try {
    for (let i = 1; i <= files; i++) {
      const baseName = `legal_${Date.now()}_${i}`;
      const intermediate = format === 'xml' ? 'csv' : format;
      const input = path.join(OUTPUT_DIR, `${baseName}.${intermediate}`);
      const output = path.join(OUTPUT_DIR, `${baseName}.xml`);

      await generateFile(baseName, outcomes, intermediate, options);

      if (format === 'xml') {
        await convertFileToXml(input, output);
        fs.unlinkSync(input);
        results.push(output);
      } else {
        results.push(input);
      }
    }
    console.log(`🎉 All Civil files generated in ${OUTPUT_DIR}`);
    return results;
  } catch (err) {
    console.error('❌ Civil file generation failed:', err);
    throw err;
  } finally {
    await destroySubmissionPeriodManager();
  }
}


