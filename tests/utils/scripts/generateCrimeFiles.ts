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

// ---------- 1️⃣ Setup ----------
let providerApiAvailable = true;

// ---------- 2️⃣ Config ----------
const offices = ['0P322F', '1T102C', '2L848R'];
const feeCodes = ['APPA','APPB'];
const OUTPUT_DIR = 'generated_submissions_crime';
const PROVIDER_API =
    process.env.PROVIDER_API ||
    'https://laa-provider-details-api-uat.apps.live.cloud-platform.service.justice.gov.uk/api/v1/provider-offices';

// 🔐 Global lower bound – you said “from April 2015 onwards”
const GLOBAL_MIN_CASE_DATE = new Date('2015-04-01');

// Police Stations
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

// ---------- 3️⃣ Helpers ----------
const pad = (num: number, len = 2) => num.toString().padStart(len, '0');
const randomFrom = <T>(arr: T[]): T =>
    arr[Math.floor(Math.random() * arr.length)];
const randomMoney = (min: number, max: number) =>
    faker.number.float({ min, max, fractionDigits: 2 });
const formatDate = (date: Date) =>
    date.toISOString().split('T')[0].split('-').reverse().join('/');
const randomDSCC = () =>
    faker.number.int({ min: 200000000, max: 299999999 }) +
    randomFrom(['A', 'B', 'C', 'D']);
const generateUFN = (date: Date, caseNum: number) => {
  const dd = pad(date.getDate());
  const mm = pad(date.getMonth() + 1);
  const yy = String(date.getFullYear()).slice(-2);
  const nnn = pad(caseNum, 3);
  return `${dd}${mm}${yy}/${nnn}`;
};

// ---------- 4️⃣ Provider API (legacy helper – only used if you want direct schedule lookups per date) ----------
const fetchProviderSchedules = async (office: string, caseStartDate: Date) => {
  if (!providerApiAvailable) return undefined;

  const formattedDate = caseStartDate.toISOString().split('T')[0];
  console.log(
      `📅 Fetching provider schedules for office ${office} (effectiveDate=${formattedDate})`,
  );

  try {
    const response = await axios.get(
        `${PROVIDER_API}/${office}/schedules?effectiveDate=${formattedDate}&areaOfLaw=CRIME%20LOWER`,
        {
          headers: {
            accept: 'application/json',
            'X-Authorization':
                process.env.PROVIDER_API_KEY,
          },
          validateStatus: () => true,
        },
    );
    if (response.status === 204) return [];
    return response.data.schedules;
  } catch (err) {
    providerApiAvailable = false;
    const message = err instanceof Error ? err.message : String(err);
    console.warn(
        '⚠️ Unable to reach provider schedules API. Falling back to local date generation.',
        message,
    );
    return undefined;
  }
};

// ---------- 5️⃣ Outcome Generator (uses contract window, clamped from 2015-04-01) ----------
const generateOutcome = async (
    office: string,
    caseNum: number,
    scheduleStart?: string,
    scheduleEnd?: string,
) => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  let rangeStart: Date;
  let rangeEnd: Date;

  if (scheduleStart && scheduleEnd) {
    rangeStart = new Date(scheduleStart);
    rangeEnd = new Date(scheduleEnd);
  } else {
    // Fallback window if for some reason we didn't get contract dates
    rangeStart = new Date('2017-02-02');
    rangeEnd = new Date('2018-12-31');
    console.warn(
        `⚠️ Missing schedule window for ${office}; using fallback 2017–2018`,
    );
  }

  // 🔐 Clamp to “from 2015 April onwards”
  if (rangeStart < GLOBAL_MIN_CASE_DATE) {
    console.log(
        `ℹ️ Clamping rangeStart for ${office} from ${rangeStart.toISOString().slice(0, 10)} to ${GLOBAL_MIN_CASE_DATE.toISOString().slice(0, 10)}`,
    );
    rangeStart = new Date(GLOBAL_MIN_CASE_DATE);
  }

  // Safety: ensure end is after start
  if (rangeEnd <= rangeStart) {
    console.warn(
        `⚠️ Invalid schedule range for ${office} (${rangeStart.toISOString()} → ${rangeEnd.toISOString()}); expanding end by 6 months`,
    );
    rangeEnd = new Date(rangeStart);
    rangeEnd.setMonth(rangeEnd.getMonth() + 6);
  }

  // 🧭 Choose a case start date strictly within (clamped) contract window
  const caseStartDate = faker.date.between({ from: rangeStart, to: rangeEnd });
  const workConcludedDate = faker.date.between({
    from: caseStartDate,
    to: rangeEnd,
  });

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
      'NCD',
      'MOB',
      'DEA',
      'HEA',
      'VIS',
      'BLI',
      'MHC',
      'LDD',
      'COG',
      'ILL',
      'OTH',
      'UKN',
      'PHY',
      'SEN',
    ]),
    stage_reached_code: randomFrom(['INVC', 'PROD', 'PROK']),
    travel_waiting_costs: randomMoney(0, 40),
    case_start_date: formatDate(caseStartDate),
    work_concluded_date: formatDate(workConcludedDate),
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

// ---------- 6️⃣ File Generator ----------
const generateFile = async (
    fileName: string,
    outcomesCount: number,
    fileType: 'txt' | 'csv',
    options: GenerateFileOptions = {},
) => {
  let office = options.office ?? randomFrom(offices);
  let submissionPeriod: string | null = null;
  let scheduleStart: string | undefined;
  let scheduleEnd: string | undefined;
  const triedOffices = new Set<string>();

  for (let attempt = 0; attempt < offices.length; attempt++) {
    triedOffices.add(office);
    try {
      const {
        period,
        scheduleStart: start,
        scheduleEnd: end,
      } = await getUniqueSubmissionPeriod(office, 'CRIME LOWER');
      submissionPeriod = period;
      scheduleStart = start;
      scheduleEnd = end;
      console.log(
          `✅ Using ${submissionPeriod} for ${office} (${scheduleStart} → ${scheduleEnd})`,
      );
      break;
    } catch (err: any) {
      console.warn(`⚠️ ${err.message || err} — trying another office...`);
      const remaining = offices.filter(o => !triedOffices.has(o));
      if (remaining.length === 0) {
        throw new Error(
            `❌ No valid submission period found for any office: ${offices.join(', ')}`,
        );
      }
      office = randomFrom(remaining);
    }
  }

  if (!submissionPeriod) {
    throw new Error(
        `❌ Unable to find valid submission period after checking all offices`,
    );
  }

  let content = `OFFICE,account=${office}\n`;
  content += `SCHEDULE,submissionPeriod=${submissionPeriod},areaOfLaw=CRIME LOWER,scheduleNum=${office}/CRM\n`;

  for (let i = 0; i < outcomesCount; i++) {
    const o = await generateOutcome(office, i, scheduleStart, scheduleEnd);
    const claimOverride = options.claims?.[i];
    const feeCode = claimOverride?.feeCode ?? randomFrom(feeCodes);
    const profitCost = claimOverride?.profitCost ?? o.profit_cost;
    const travelCost = claimOverride?.travelCost ?? o.travel_costs;
    const disbursementAmount =
        claimOverride?.disbursementAmount ?? o.disbursements_amount;
    const matterType = feeCode.substring(0, 4);

    content += `OUTCOME,FEE_CODE=${feeCode},matterType=${matterType},UFN=${o.ufn},CLIENT_FORENAME=${o.client_forename},CLIENT_SURNAME=${o.client_surname},GENDER=${o.gender},ETHNICITY=${o.ethnicity},DISABILITY=${o.disability},CASE_START_DATE=${o.case_start_date},PROFIT_COST=${profitCost},DISBURSEMENTS_AMOUNT=${disbursementAmount},DISBURSEMENTS_VAT=${o.disbursements_vat},VAT_INDICATOR=${o.vat_indicator},TRAVEL_COSTS=${travelCost},OUTCOME_CODE=${o.outcome_code},CRIME_MATTER_TYPE=${o.crime_matter_type},TRAVEL_WAITING_COSTS=${o.travel_waiting_costs},WORK_CONCLUDED_DATE=${o.work_concluded_date},NO_OF_SUSPECTS=${o.no_of_suspects},NO_OF_POLICE_STATION=${o.no_of_police_station},POLICE_STATION=${o.police_station},DUTY_SOLICITOR=${o.duty_solicitor},YOUTH_COURT=${o.youth_court},SCHEME_ID=${o.scheme_id},DSCC_NUMBER=${o.dscc_number}\n`;
  }

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);
  fs.writeFileSync(
      path.join(OUTPUT_DIR, `${fileName}.${fileType}`),
      content,
      'utf-8',
  );
  console.log(
      `✅ Generated ${fileName}.${fileType} (${outcomesCount} outcomes) for ${office}`,
  );
};

// ---------- 7️⃣ Public Export ----------
export async function GenerateCrimeFiles(
    files: number,
    outcomes: number,
    format: 'txt' | 'csv' | 'xml',
    options: GenerateFileOptions = {},
): Promise<{ filePaths: string[]; office: string }> {
  const generatedFiles: string[] = [];
  const officeInput = options.office ?? randomFrom(offices);

  try {
    for (let i = 1; i <= files; i++) {
      const uniquePart =
          options.suffix || `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const baseName = `crime_${uniquePart}_${i}`;
      const intermediateFormat = format === 'xml' ? 'csv' : format;

      await generateFile(baseName, outcomes, intermediateFormat, {
        ...options,
        office: officeInput,
      });
      const inputFile = path.join(
          OUTPUT_DIR,
          `${baseName}.${intermediateFormat}`,
      );
      const outputFile = path.join(OUTPUT_DIR, `${baseName}.xml`);

      if (format === 'xml') {
        await convertFileToXml(inputFile, outputFile);
        fs.unlinkSync(inputFile);
        generatedFiles.push(outputFile);
      } else {
        generatedFiles.push(inputFile);
      }
    }

    console.log(`🎉 Crime files ready for ${officeInput}`);
    return { filePaths: generatedFiles, office: officeInput };
  } catch (err) {
    console.error('❌ Error generating Crime files:', err);
    throw err;
  }
}
