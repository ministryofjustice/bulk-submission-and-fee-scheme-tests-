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

// ---------- 1️⃣ Setup ----------
let providerApiAvailable = true;

// ---------- 2️⃣ Config ----------
const offices = ['0P322F'];
const feeCodes = ['INVC'];
const OUTPUT_DIR = "generated_submissions_crime";
const PROVIDER_API = process.env.PROVIDER_API || 'https://laa-provider-details-api-uat.apps.live.cloud-platform.service.justice.gov.uk/api/v1/provider-offices';
const MIN_CASE_START = new Date('2018-01-01');

// Police Stations
const policeStations = [
  {id: 'NE001', name: 'HARTLEPOOL', schemeId: 1001},
  {id: 'NE900', name: 'HARTLEPOOL NON-POLICE STATION', schemeId: 1001},
  {id: 'NE002', name: 'GUISBOROUGH', schemeId: 1002},
  {id: 'NE003', name: 'SOUTH BANK', schemeId: 1002},
  {id: 'RD001', name: 'RAF BRIZE NORTON', schemeId: 1131},
  {id: 'RD002', name: 'WITNEY', schemeId: 1131},
  {id: 'RD003', name: 'ABINGDON', schemeId: 1131},
  {id: 'RD016', name: 'BLETCHLEY', schemeId: 1134},
];

// ---------- 3️⃣ Helpers ----------
const pad = (num: number, len = 2) => num.toString().padStart(len, "0");
const randomFrom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomMoney = (min: number, max: number) => faker.number.float({min, max, fractionDigits: 2});
const formatDate = (date: Date) => date.toISOString().split('T')[0].split('-').reverse().join('/');
const randomDSCC = () => faker.number.int({
  min: 200000000,
  max: 299999999
}) + randomFrom(['A', 'B', 'C', 'D']);
const generateUFN = (date: Date, caseNum: number) => {
  const dd = pad(date.getDate());
  const mm = pad(date.getMonth() + 1);
  const yy = String(date.getFullYear()).slice(-2);
  const nnn = pad(caseNum, 3);
  return `${dd}${mm}${yy}/${nnn}`;
};

// ---------- 4️⃣ Provider API Check ----------
// ---------- 4️⃣ Provider API Check ----------
const fetchProviderSchedules = async (office: string, caseStartDate: Date) => {
  if (!providerApiAvailable) return undefined;

  const formattedDate = caseStartDate.toISOString().split('T')[0];

  // 🔹 Log the date being passed
  console.log(`📅 Fetching provider schedules for office ${office} with effectiveDate=${formattedDate}`);

  try {
    const response = await axios.get(`${PROVIDER_API}/${office}/schedules?effectiveDate=${formattedDate}&areaOfLaw=CRIME%20LOWER`, {
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
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  // 🧭 Restrict UFN/Case start date strictly between 2 Feb 2017 – 31 Dec 2018
  const ufnMin = new Date('2017-02-02');
  const ufnMax = new Date('2018-12-31');

  let caseStartDate: Date | null = null;

  for (let attempt = 0; attempt < 100; attempt++) {
    const candidateDate = faker.date.between({from: ufnMin, to: ufnMax});
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
    caseStartDate = faker.date.between({from: ufnMin, to: ufnMax});
    console.warn(`ℹ️ Using locally generated case start date for office ${office}`);
  }

  // 📅 Ensure work concluded date is always after case start
  const workConcludedDate = faker.date.between({from: caseStartDate, to: ufnMax});
  const ufn = generateUFN(caseStartDate, caseNum);
  const station = randomFrom(policeStations);

  return {
    client_forename: firstName,
    client_surname: lastName,
    gender: randomFrom(['M', 'F']),
    ethnicity: randomFrom(['99', '01', '02', '03', '04']),
    profit_cost: randomMoney(10, 200),
    disbursements_amount: randomMoney(0, 50),
    disbursements_vat: randomMoney(0, 1.98),
    vat_indicator: randomFrom(['Y', 'N']),
    travel_costs: randomMoney(0, 100),
    outcome_code: randomFrom(['CN04', 'CN02', 'CN01', 'CN08']),
    crime_matter_type: pad(Number(randomFrom(['1', '2', '3'])), 2),
    disability: randomFrom([
      'NCD', 'MOB', 'DEA', 'HEA', 'VIS', 'BLI', 'MHC', 'LDD', 'COG',
      'ILL', 'OTH', 'UKN', 'PHY', 'SEN'
    ]),
    stage_reached_code: randomFrom(['INVC', 'PROD', 'PROK']),
    travel_waiting_costs: randomMoney(0, 40),
    case_start_date: formatDate(caseStartDate),
    work_concluded_date: formatDate(workConcludedDate),
    no_of_suspects: faker.number.int({min: 1, max: 3}),
    no_of_police_station: 1,
    police_station: station.id,
    duty_solicitor: randomFrom(['Y', 'N']),
    youth_court: randomFrom(['Y', 'N']),
    scheme_id: station.schemeId,
    dscc_number: randomDSCC(),
    ufn
  };
};

// ---------- 7️⃣ File Generator ----------
const generateFile = async (fileName: string,
                            outcomesCount: number,
                            fileType: 'txt' | 'csv',
                            claims?: claimOptions[]) => {
  const office = randomFrom(offices);
  const submissionPeriod = await getUniqueSubmissionPeriod(office, 'CRIME LOWER');

  let content = `OFFICE,account=${office}\n`;
  content += `SCHEDULE,submissionPeriod=${submissionPeriod},areaOfLaw=CRIME LOWER,scheduleNum=${office}/CRM\n`;

  for (let i = 0; i < outcomesCount; i++) {
    const o = await generateOutcome(office, i);
    let feeCode = randomFrom(feeCodes);
    let matterType = feeCode.substring(0, 4);
    let profitCost = o.profit_cost;
    if (claims?.[i] !== undefined) {
      console.log(`➕Currently adding crime lower claim ${i}: ${claims[i].feeCode}, ${claims[i].profitCost}`);

      feeCode = claims[i].feeCode ?? randomFrom(feeCodes);
      profitCost = claims[i].profitCost ?? o.profit_cost;
    }

    content += `OUTCOME,FEE_CODE=${feeCode},matterType=${matterType},UFN=${o.ufn},CLIENT_FORENAME=${o.client_forename},CLIENT_SURNAME=${o.client_surname},GENDER=${o.gender},ETHNICITY=${o.ethnicity},DISABILITY=${o.disability},CASE_START_DATE=${o.case_start_date},PROFIT_COST=${profitCost},DISBURSEMENTS_AMOUNT=${o.disbursements_amount},DISBURSEMENTS_VAT=${o.disbursements_vat},VAT_INDICATOR=${o.vat_indicator},TRAVEL_COSTS=${o.travel_costs},OUTCOME_CODE=${o.outcome_code},CRIME_MATTER_TYPE=${o.crime_matter_type},TRAVEL_WAITING_COSTS=${o.travel_waiting_costs},WORK_CONCLUDED_DATE=${o.work_concluded_date},NO_OF_SUSPECTS=${o.no_of_suspects},NO_OF_POLICE_STATION=${o.no_of_police_station},POLICE_STATION=${o.police_station},DUTY_SOLICITOR=${o.duty_solicitor},YOUTH_COURT=${o.youth_court},SCHEME_ID=${o.scheme_id},DSCC_NUMBER=${o.dscc_number}\n`;
  }

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);
  fs.writeFileSync(path.join(OUTPUT_DIR, `${fileName}.${fileType}`), content, 'utf-8');
  console.log(`✅ Generated ${fileName}.${fileType} with ${outcomesCount} outcomes for office ${office}`);
};


export async function GenerateCrimeFiles(
    files: number,
    outcomes: number,
    format: 'txt' | 'csv' | 'xml',
    suffix?: string,
    options?: claimOptions[]
): Promise<string[]> {
  const generatedFiles: string[] = [];



  try {
    for (let i = 1; i <= files; i++) {const uniquePart = suffix || `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const baseName = `crime_${uniquePart}_${i}`;
      const intermediateFormat = format === 'xml' ? 'csv' : format;

      const inputFile = path.join(OUTPUT_DIR, `${baseName}.${intermediateFormat}`);
      const outputFile = path.join(OUTPUT_DIR, `${baseName}.xml`);

      // ✅ Step 1: Generate the file (csv/txt)
      await generateFile(baseName, outcomes, intermediateFormat, options);
      console.log(`🧾 File generated: ${inputFile}`);

      if (format === 'xml') {
        // ✅ Step 2: Convert CSV to XML
        await convertFileToXml(inputFile, outputFile);
        console.log(`✅ Converted to XML: ${outputFile}`);

        // ✅ Step 3: Delete temporary CSV
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
