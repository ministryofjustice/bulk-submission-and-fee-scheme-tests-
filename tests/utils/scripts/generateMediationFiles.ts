import fs from 'fs';
import path from 'path';
import axios from 'axios';
import {faker} from '@faker-js/faker';

import 'reflect-metadata';
import dotenv from 'dotenv';
import {convertFileToXml} from "./converter";
import {getUniqueSubmissionPeriod} from './submissionPeriodHelper';
import {claimOptions} from "./claimOptions";
dotenv.config();

const AREA_OF_LAW = 'MEDIATION';
// ---------- 1️⃣ Database Setup ----------
let providerApiAvailable = true;

// ---------- 2️⃣ Config ----------
const offices = ['0P322F'];
const feeCodes = ['ASSA'];
const OUTPUT_DIR = "generated_submissions_mediation";
const PROVIDER_API = process.env.PROVIDER_API || 'https://laa-provider-details-api-uat.apps.live.cloud-platform.service.justice.gov.uk/api/v1/provider-offices';
const MIN_CASE_START = new Date('2015-05-01');
const MAX_CASE_START = new Date('2025-10-31');

// ---------- 3️⃣ Helpers ----------
const pad = (num: number, len = 2) => num.toString().padStart(len, "0");
const randomFrom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const formatDate = (date: Date) => date.toISOString().split('T')[0].split('-').reverse().join('/');
const sanitizeForCode = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

const generateUFN = (date: Date, caseNum: number) => {
  const dd = pad(date.getDate());
  const mm = pad(date.getMonth() + 1);
  const yy = String(date.getFullYear()).slice(-2);
  const nnn = pad(caseNum, 3);
  return `${dd}${mm}${yy}/${nnn}`;
};

// ---------- 4️⃣ Provider API Check ----------
const fetchProviderSchedules = async (office: string, caseStartDate: Date) => {
  if (!providerApiAvailable) return undefined;

  const formattedDate = caseStartDate.toISOString().split('T')[0];
  try {
    const response = await axios.get(`${PROVIDER_API}/${office}/schedules?effectiveDate=${formattedDate}&areaOfLaw=MEDIATION`, {
      headers: {
        accept: 'application/json',
        'X-Authorization': process.env.PROVIDER_API_KEY || 'dpd_e42*u+gb6@rp8qNmccvDUd'
      },
      validateStatus: () => true
    });
    if (response.status === 204) return [];
    return response.data.schedules;
  } catch (err) {
    providerApiAvailable = false;
    const message = err instanceof Error ? err.message : String(err);
    console.warn('⚠️ Unable to reach provider schedules API. Falling back to local date generation.', message);
    return undefined;
  }
};

const generateOutcome = async (office: string, caseNum: number) => {
  const client1First = faker.person.firstName();
  const client1Last = faker.person.lastName();
  const client2First = faker.person.firstName();
  const client2Last = faker.person.lastName();
  const dob1 = faker.date.between({from: new Date('1950-01-01'), to: new Date('2000-12-31')});
  const dob2 = faker.date.between({from: new Date('1950-01-01'), to: new Date('2000-12-31')});


  let caseStartDate: Date | null = null;
  for (let attempt = 0; attempt < 50; attempt++) {
    const candidateDate = faker.date.between({from: MIN_CASE_START, to: MAX_CASE_START});
    const schedules = await fetchProviderSchedules(office, candidateDate);
    if (schedules === undefined) {
      caseStartDate = candidateDate;
      break;
    }
    if (!schedules || schedules.length === 0) continue;
    const validSchedule = schedules.find((s: any) => {
      const start = new Date(s.scheduleStartDate);
      const end = new Date(s.scheduleEndDate);
      return candidateDate >= start && candidateDate <= end;
    });
    if (validSchedule) {
      caseStartDate = candidateDate;
      break;
    }
  }


  if (!caseStartDate) {
    caseStartDate = faker.date.between({from: MIN_CASE_START, to: MAX_CASE_START});
    console.warn(`ℹ️ Using locally generated case start date for office ${office}`);
  }


  const medConcluded = faker.date.between({from: caseStartDate, to: new Date()});
  const workConcluded = faker.date.between({from: caseStartDate, to: medConcluded});
  const ufn = generateUFN(caseStartDate, caseNum);


  const sanitizeForCode = (str: string) => str.replace(/[^\p{L}0-9 \-’'&]/gu, '').toUpperCase();


// Generate UCN compliant with regex ^(DD)(MM)(YYYY)/F/SURNAME (1-4 chars)
  const ucn1 = `${pad(dob1.getDate())}${pad(dob1.getMonth() + 1)}${dob1.getFullYear()}/${client1Last[0].toUpperCase()}/${sanitizeForCode(client1Last).slice(0, 4)}`;
  const ucn2 = `${pad(dob2.getDate())}${pad(dob2.getMonth() + 1)}${dob2.getFullYear()}/${client2Last[0].toUpperCase()}/${sanitizeForCode(client2Last).slice(0, 4)}`;


  return {
    case_ref_number: faker.number.int({min: 1000, max: 9999}),
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
    number_of_sessions: faker.number.int({min: 1, max: 5}),
    mediation_time: faker.number.int({min: 60, max: 240}),
    fee_code: randomFrom(feeCodes),
    //@ts-ignore
    disbursements_amount: faker.finance.amount(0, 200, 2),
    //@ts-ignore
    disbursements_vat: faker.finance.amount(0, 50, 2),
    vat_indicator: randomFrom(['Y', 'N']),
    unique_case_id: `${ufn}`,
    outreach: faker.helpers.arrayElement(['000', '001', '002']),
    referral: faker.helpers.arrayElement(['08', '09', '10']),
    ucn1,
    ucn2
  };
};

const generateFile = async (fileName: string,
                            outcomesCount: number,
                            fileType: 'txt' | 'csv',
                            claims?: claimOptions[]) => {
  const office = randomFrom(offices);
  const submissionPeriod = await getUniqueSubmissionPeriod(office, AREA_OF_LAW);


// Create a safe schedule number (<= 20 chars)
  const monthCode = submissionPeriod.slice(0, 3).toUpperCase(); // e.g., 'MAR'
  const yearCode = submissionPeriod.slice(-4).slice(-2); // e.g., '24'
  const scheduleNum = `${office}/MEDI${monthCode}${yearCode}/01`; // <= 20 chars guaranteed


  let content = `OFFICE,account=${office}\n`;
  content += `SCHEDULE,submissionPeriod=${submissionPeriod},areaOfLaw=MEDIATION,scheduleNum=${scheduleNum}\n`;


  for (let i = 0; i < outcomesCount; i++) {
    const o = await generateOutcome(office, i);
    let feeCode = randomFrom(feeCodes);
    if (claims?.[i] !== undefined) {
      console.log(`➕Currently adding mediation claim ${i}: ${claims[i].feeCode}, ${claims[i].profitCost}`);
      feeCode = claims[i].feeCode ?? randomFrom(feeCodes);
    }

    content += `OUTCOME,FEE_CODE=${feeCode},matterType=MEDI:MDCS,CASE_START_DATE=${o.case_start_date},CASE_ID=${o.case_id},UFN=${o.ufn},CLIENT_FORENAME=${o.client1_first},CLIENT_SURNAME=${o.client1_last},CLIENT_DATE_OF_BIRTH=${o.client1_dob},UCN=${o.ucn1},GENDER=${o.client1_gender},ETHNICITY=${o.client1_ethnicity},DISABILITY=${o.client1_disability},CLIENT_POST_CODE=${o.client1_postcode},CLIENT_LEGALLY_AIDED=${o.client1_legally_aided},CLIENT2_FORENAME=${o.client2_first},CLIENT2_SURNAME=${o.client2_last},CLIENT2_DATE_OF_BIRTH=${o.client2_dob},CLIENT2_UCN=${o.ucn2},CLIENT2_GENDER=${o.client2_gender},CLIENT2_ETHNICITY=${o.client2_ethnicity},CLIENT2_DISABILITY=${o.client2_disability},CLIENT2_POST_CODE=${o.client2_postcode},CLIENT2_LEGALLY_AIDED=${o.client2_legally_aided},MED_CONCLUDED_DATE=${o.med_concluded_date},WORK_CONCLUDED_DATE=${o.work_concluded_date},NUMBER_OF_MEDIATION_SESSIONS=${o.number_of_sessions},MEDIATION_TIME=${o.mediation_time},CASE_REF_NUMBER=${o.case_ref_number},OUTCOME_CODE=${o.outcome_code},DISBURSEMENTS_AMOUNT=${o.disbursements_amount},DISBURSEMENTS_VAT=${o.disbursements_vat},VAT_INDICATOR=${o.vat_indicator},UNIQUE_CASE_ID=${o.unique_case_id},OUTREACH=${o.outreach},REFERRAL=${o.referral},POSTAL_APPL_ACCP=Y,CLIENT2_POSTAL_APPL_ACCP=N,SCHEDULE_REF=${scheduleNum}\n`;
  }


  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);
  fs.writeFileSync(path.join(OUTPUT_DIR, `${fileName}.${fileType}`), content, 'utf-8');
  console.log(`✅ Generated ${fileName}.${fileType} with ${outcomesCount} outcomes for office ${office}`);
};

export async function GenerateMediationFiles(
    files: number,
    outcomes: number,
    format: 'txt' | 'csv' | 'xml',
    suffix?: string,
    options?: claimOptions[]
): Promise<string[]> {
  const generatedFiles: string[] = [];



  try {
    for (let i = 1; i <= files; i++) {const uniquePart = suffix || `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const baseName = `mediation_${uniquePart}_${i}`;
      const intermediateFormat = format === 'xml' ? 'csv' : format;

      const inputFile = path.join(OUTPUT_DIR, `${baseName}.${intermediateFormat}`);
      const outputFile = path.join(OUTPUT_DIR, `${baseName}.xml`);

      // ✅ Step 1: Generate the base file (CSV/TXT)
      await generateFile(baseName, outcomes, intermediateFormat, options);
      console.log(`🧾 File generated: ${inputFile}`);

      if (format === 'xml') {
        // ✅ Step 2: Convert to XML
        await convertFileToXml(inputFile, outputFile);
        console.log(`✅ Converted to XML: ${outputFile}`);

        // ✅ Step 3: Delete temporary CSV file
        try {
          fs.unlinkSync(inputFile);
          console.log(`🧹 Deleted temporary file: ${inputFile}`);
        } catch (deleteErr) {
          console.warn(`⚠️ Could not delete ${inputFile}:`, deleteErr);
        }

        generatedFiles.push(outputFile);
      } else {
        generatedFiles.push(inputFile);
      }
    }

    console.log(`\n🎉 Completed. Files saved in: ${OUTPUT_DIR}/`);
    return generatedFiles;
  } catch (err) {
    console.error('❌ Error:', err);
    throw err;
  } finally {
    // No shared DB connection to close here
  }
}
