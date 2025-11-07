import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import { convertFileToXml } from './converter';
import { getUniqueSubmissionPeriod, destroySubmissionPeriodManager } from './submissionPeriodHelper';
import { createDataSourceManager } from '../db/dataSourceManager';
import { GenerateFileOptions } from './generateFileOptions';

dotenv.config();

// ---------- ⚙️ Constants ----------
const AREA_OF_LAW = 'CRIME LOWER';
const OUTPUT_DIR = 'generated_submissions_crime';
const offices = ['0P322F'];
const feeCodes = ['INVC'];
let providerApiAvailable = true;

const PROVIDER_API =
    process.env.PROVIDER_API ||
    'https://laa-provider-details-api-uat.apps.live.cloud-platform.service.justice.gov.uk/api/v1/provider-offices';

// ---------- 🏢 Police Stations ----------
const policeStations = [
  { id: 'NE001', name: 'HARTLEPOOL', schemeId: 1001 },
  { id: 'NE900', name: 'HARTLEPOOL NON-POLICE STATION', schemeId: 1001 },
  { id: 'NE002', name: 'GUISBOROUGH', schemeId: 1002 },
  { id: 'NE003', name: 'SOUTH BANK', schemeId: 1002 },
  { id: 'RD001', name: 'RAF BRIZE NORTON', schemeId: 1131 },
  { id: 'RD002', name: 'WITNEY', schemeId: 1131 },
  { id: 'RD003', name: 'ABINGDON', schemeId: 1131 },
  { id: 'RD016', name: 'BLETCHLEY', schemeId: 1134 },
];

// ---------- 🧮 Helpers ----------
const pad = (n: number, len = 2) => n.toString().padStart(len, '0');
const randomFrom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomMoney = (min: number, max: number) => faker.number.float({ min, max, fractionDigits: 2 });
const formatDate = (d: Date) => d.toISOString().split('T')[0].split('-').reverse().join('/');
const randomDSCC = () =>
    faker.number.int({ min: 200000000, max: 299999999 }) + randomFrom(['A', 'B', 'C', 'D']);

const generateUFN = (date: Date, caseNum: number) =>
    `${pad(date.getDate())}${pad(date.getMonth() + 1)}${String(date.getFullYear()).slice(-2)}/${pad(caseNum, 3)}`;

// ---------- 🧩 Data Source ----------
const dataSourceManager = createDataSourceManager({ label: 'generateCrimeFiles' });

// ---------- 🔗 Provider API ----------
const fetchProviderSchedules = async (office: string, caseStartDate: Date) => {
  if (!providerApiAvailable) return undefined;

  try {
    const response = await axios.get(
        `${PROVIDER_API}/${office}/schedules?effectiveDate=${caseStartDate.toISOString().split('T')[0]}&areaOfLaw=${encodeURIComponent(
            AREA_OF_LAW
        )}`,
        {
          headers: {
            accept: 'application/json',
            'X-Authorization': process.env.PROVIDER_API_KEY || 'dpd_e42*u+gb6@rp8qNmccvDUd',
          },
          validateStatus: () => true,
        }
    );

    if (response.status === 204) return [];
    return response.data.schedules;
  } catch (err) {
    providerApiAvailable = false;
    console.warn('⚠️ Provider API unreachable, falling back to local generation:', err);
    return undefined;
  }
};

// ---------- 🧠 Outcome Generator ----------
const generateOutcome = async (office: string, caseNum: number) => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const ufnMin = new Date('2017-02-02');
  const ufnMax = new Date('2018-12-31');
  let caseStartDate: Date | null = null;

  for (let attempt = 0; attempt < 100; attempt++) {
    const candidate = faker.date.between({ from: ufnMin, to: ufnMax });
    const schedules = await fetchProviderSchedules(office, candidate);
    if (schedules === undefined) {
      caseStartDate = candidate;
      break;
    }
    if (!schedules || schedules.length === 0) continue;

    const validSchedule = schedules.find(
        (s: any) =>
            candidate >= new Date(s.scheduleStartDate) && candidate <= new Date(s.scheduleEndDate)
    );
    if (validSchedule) {
      caseStartDate = candidate;
      break;
    }
  }

  if (!caseStartDate) {
    caseStartDate = faker.date.between({ from: ufnMin, to: ufnMax });
    console.warn(`ℹ️ Using locally generated start date for ${office}`);
  }

  const workConcluded = faker.date.between({ from: caseStartDate, to: ufnMax });
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
      'ILL', 'OTH', 'UKN', 'PHY', 'SEN',
    ]),
    stage_reached_code: randomFrom(['INVC', 'PROD', 'PROK']),
    travel_waiting_costs: randomMoney(0, 40),
    case_start_date: formatDate(caseStartDate),
    work_concluded_date: formatDate(workConcluded),
    no_of_suspects: faker.number.int({ min: 1, max: 3 }),
    no_of_police_station: 1,
    police_station: station.id,
    duty_solicitor: randomFrom(['Y', 'N']),
    youth_court: randomFrom(['Y', 'N']),
    scheme_id: station.schemeId,
    dscc_number: randomDSCC(),
    ufn,
  };
};

// ---------- 🧾 File Generator ----------
const generateFile = async (
    fileName: string,
    outcomesCount: number,
    fileType: 'txt' | 'csv',
    options: GenerateFileOptions = {}
) => {
  const office = options.office ?? randomFrom(offices);
  const submissionPeriod =
      options.submissionPeriod ?? (await getUniqueSubmissionPeriod(office, "CRIME_LOWER"));

  let content = `OFFICE,account=${office}\n`;
  content += `SCHEDULE,submissionPeriod=${submissionPeriod},areaOfLaw=${AREA_OF_LAW},scheduleNum=${office}/CRM\n`;

  for (let i = 1; i <= outcomesCount; i++) {
    const o = await generateOutcome(office, i);
    const feeCode = randomFrom(feeCodes);
    const matterType = feeCode.substring(0, 4);

    content += `OUTCOME,FEE_CODE=${feeCode},matterType=${matterType},UFN=${o.ufn},CLIENT_FORENAME=${o.client_forename},CLIENT_SURNAME=${o.client_surname},GENDER=${o.gender},ETHNICITY=${o.ethnicity},DISABILITY=${o.disability},CASE_START_DATE=${o.case_start_date},PROFIT_COST=${o.profit_cost},DISBURSEMENTS_AMOUNT=${o.disbursements_amount},DISBURSEMENTS_VAT=${o.disbursements_vat},VAT_INDICATOR=${o.vat_indicator},TRAVEL_COSTS=${o.travel_costs},OUTCOME_CODE=${o.outcome_code},CRIME_MATTER_TYPE=${o.crime_matter_type},TRAVEL_WAITING_COSTS=${o.travel_waiting_costs},WORK_CONCLUDED_DATE=${o.work_concluded_date},NO_OF_SUSPECTS=${o.no_of_suspects},NO_OF_POLICE_STATION=${o.no_of_police_station},POLICE_STATION=${o.police_station},DUTY_SOLICITOR=${o.duty_solicitor},YOUTH_COURT=${o.youth_court},SCHEME_ID=${o.scheme_id},DSCC_NUMBER=${o.dscc_number}\n`;
  }

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);
  fs.writeFileSync(path.join(OUTPUT_DIR, `${fileName}.${fileType}`), content, 'utf-8');
  console.log(`✅ Generated ${fileName}.${fileType} (${outcomesCount} outcomes)`);
};

// ---------- 🚀 Export ----------
export async function GenerateCrimeFiles(
    files: number,
    outcomes: number,
    format: 'txt' | 'csv' | 'xml',
    options: GenerateFileOptions = {}
): Promise<string[]> {
  const generated: string[] = [];

  await dataSourceManager.ensureInitialized();

  try {
    for (let i = 1; i <= files; i++) {
      const unique = options.suffix || `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const baseName = `crime_${unique}_${i}`;
      const intermediate = format === 'xml' ? 'csv' : format;
      const inputFile = path.join(OUTPUT_DIR, `${baseName}.${intermediate}`);
      const outputFile = path.join(OUTPUT_DIR, `${baseName}.xml`);

      await generateFile(baseName, outcomes, intermediate, options);
      console.log(`🧾 File created: ${inputFile}`);

      if (format === 'xml') {
        await convertFileToXml(inputFile, outputFile);
        fs.unlinkSync(inputFile);
        console.log(`✅ Converted & cleaned: ${outputFile}`);
        generated.push(outputFile);
      } else {
        generated.push(inputFile);
      }
    }

    console.log(`🎉 Crime files saved under ${OUTPUT_DIR}`);
    return generated;
  } catch (err) {
    console.error('❌ Error during Crime file generation:', err);
    throw err;
  } finally {
    await dataSourceManager.destroy();
    await destroySubmissionPeriodManager();
  }
}
