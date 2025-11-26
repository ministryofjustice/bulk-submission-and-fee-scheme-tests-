import fs from 'fs';
import path from 'path';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import { convertFileToXml } from './converter';
import { getUniqueSubmissionPeriod } from './submissionPeriodHelper';
import { claimOptions } from './claimOptions';
import { GenerateFileOptions } from './generateFileOptions';

dotenv.config();

// ------------------------------
// 1️⃣ Config
// ------------------------------
const offices = ['0P322F', '1T102C', '2L848R'];
const feeCodes = ['APPA', 'APPB'];
const OUTPUT_DIR = 'generated_submissions_crime';

const GLOBAL_MIN_CASE_DATE = new Date('2015-04-01');

const policeStations = [
  { id: 'NE001', schemeId: 1001 },
  { id: 'NE900', schemeId: 1001 },
  { id: 'NE002', schemeId: 1002 },
  { id: 'NE003', schemeId: 1002 },
  { id: 'RD001', schemeId: 1131 },
  { id: 'RD002', schemeId: 1131 },
  { id: 'RD003', schemeId: 1131 },
  { id: 'RD016', schemeId: 1134 },
];

// ------------------------------
// 2️⃣ Helpers
// ------------------------------
const pad = (n: number, len = 2) => n.toString().padStart(len, '0');
const random = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

const dateFmt = (d: Date) =>
    d.toISOString().split('T')[0].split('-').reverse().join('/');

const money = (min: number, max: number) =>
    faker.number.float({ min, max, fractionDigits: 2 });

const dscc = () =>
    faker.number.int({ min: 200000000, max: 299999999 }) + random(['A', 'B', 'C', 'D']);

const makeUFN = (d: Date, caseNum: number) =>
    `${pad(d.getDate())}${pad(d.getMonth() + 1)}${String(d.getFullYear()).slice(-2)}/${pad(caseNum, 3)}`;

// ------------------------------
// 3️⃣ Outcome Generator
// ------------------------------
async function generateOutcome(
    office: string,
    caseNum: number,
    scheduleStart?: string,
    scheduleEnd?: string
) {
  const first = faker.person.firstName();
  const last = faker.person.lastName();

  let start = scheduleStart ? new Date(scheduleStart) : new Date('2017-02-02');
  let end = scheduleEnd ? new Date(scheduleEnd) : new Date('2018-12-31');

  if (start < GLOBAL_MIN_CASE_DATE) start = new Date(GLOBAL_MIN_CASE_DATE);

  if (end <= start) {
    end = new Date(start);
    end.setMonth(end.getMonth() + 6);
  }

  const caseStart = faker.date.between({ from: start, to: end });
  const concluded = faker.date.between({ from: caseStart, to: end });

  const ufn = makeUFN(caseStart, caseNum);
  const station = random(policeStations);

  return {
    client_forename: first,
    client_surname: last,
    gender: random(['M', 'F']),
    ethnicity: random(['99', '01', '02', '03', '04']),
    profit_cost: money(10, 200),
    disbursements_amount: money(0, 50),
    disbursements_vat: money(0, 1.98),
    vat_indicator: random(['Y', 'N']),
    travel_costs: money(0, 100),
    outcome_code: random(['CN04', 'CN02', 'CN01', 'CN08']),
    crime_matter_type: pad(Number(random(['1', '2', '3'])), 2),
    disability: random([
      'NCD', 'MOB', 'DEA', 'HEA', 'VIS', 'BLI', 'MHC', 'LDD', 'COG', 'ILL', 'OTH', 'UKN', 'PHY', 'SEN'
    ]),
    stage_reached_code: random(['INVC', 'PROD', 'PROK']),
    travel_waiting_costs: money(0, 40),
    case_start_date: dateFmt(caseStart),
    work_concluded_date: dateFmt(concluded),
    no_of_suspects: faker.number.int({ min: 1, max: 3 }),
    police_station: station.id,
    no_of_police_station: 1,
    duty_solicitor: random(['Y', 'N']),
    youth_court: random(['Y', 'N']),
    scheme_id: station.schemeId,
    dscc_number: dscc(),
    ufn,
  };
}

// ------------------------------
// 4️⃣ File Generator (FULL OVERRIDE SUPPORT)
// ------------------------------
async function generateFile(
    fileName: string,
    outcomesCount: number,
    fileType: 'csv' | 'txt',
    options: GenerateFileOptions = {}
) {
  let office = options.office ?? random(offices);

  let submissionPeriod: string | null = null;
  let scheduleStart: string | undefined;
  let scheduleEnd: string | undefined;

  const tried = new Set();

  for (let i = 0; i < offices.length; i++) {
    tried.add(office);
    try {
      const res = await getUniqueSubmissionPeriod(office, 'CRIME LOWER');
      submissionPeriod = res.period;
      scheduleStart = res.scheduleStart;
      scheduleEnd = res.scheduleEnd;
      break;
    } catch {
      const remaining = offices.filter((x) => !tried.has(x));
      if (!remaining.length) throw new Error(`❌ No valid crime periods available`);
      office = random(remaining);
    }
  }

  let out = `OFFICE,account=${office}\n`;
  out += `SCHEDULE,submissionPeriod=${submissionPeriod},areaOfLaw=CRIME LOWER,scheduleNum=${office}/CRM\n`;

  for (let i = 0; i < outcomesCount; i++) {
    const base = await generateOutcome(office, i, scheduleStart, scheduleEnd);

    const o = options.claims?.[i];

    // ------------------------
    // OVERRIDES SECTION
    // ------------------------
    const feeCode = o?.feeCode ?? random(feeCodes);
    const matterType = feeCode.substring(0, 4);

    const ufn = o?.ufn ?? base.ufn;
    const profitCost = o?.profitCost ?? base.profit_cost;
    const travelCost = o?.travelCost ?? base.travel_costs;
    const disbAmt = o?.disbursementAmount ?? base.disbursements_amount;
    // @ts-ignore
    const disbVat = o?.disbursementVat ?? base.disbursements_vat;
    // @ts-ignore
    const oc = o?.outcomeCode ?? base.outcome_code;

    // @ts-ignore
    const policeStation = o?.policeStation ?? base.police_station;
    // @ts-ignore
    const schemeId = o?.schemeId ?? base.scheme_id;

    out +=
        `OUTCOME,` +
        `FEE_CODE=${feeCode},` +
        `matterType=${matterType},` +
        `UFN=${ufn},` +
        `CLIENT_FORENAME=${base.client_forename},` +
        `CLIENT_SURNAME=${base.client_surname},` +
        `GENDER=${base.gender},` +
        `ETHNICITY=${base.ethnicity},` +
        `DISABILITY=${base.disability},` +
        `CASE_START_DATE=${base.case_start_date},` +
        `PROFIT_COST=${profitCost},` +
        `DISBURSEMENTS_AMOUNT=${disbAmt},` +
        `DISBURSEMENTS_VAT=${disbVat},` +
        `VAT_INDICATOR=${base.vat_indicator},` +
        `TRAVEL_COSTS=${travelCost},` +
        `OUTCOME_CODE=${oc},` +
        `CRIME_MATTER_TYPE=${base.crime_matter_type},` +
        `TRAVEL_WAITING_COSTS=${base.travel_waiting_costs},` +
        `WORK_CONCLUDED_DATE=${base.work_concluded_date},` +
        `NO_OF_SUSPECTS=${base.no_of_suspects},` +
        `NO_OF_POLICE_STATION=${base.no_of_police_station},` +
        `POLICE_STATION=${policeStation},` +
        `DUTY_SOLICITOR=${base.duty_solicitor},` +
        `YOUTH_COURT=${base.youth_court},` +
        `SCHEME_ID=${schemeId},` +
        `DSCC_NUMBER=${base.dscc_number}\n`;
  }

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);
  fs.writeFileSync(path.join(OUTPUT_DIR, `${fileName}.${fileType}`), out, 'utf-8');
}

// ------------------------------
// 5️⃣ Public Export
// ------------------------------
export async function GenerateCrimeFiles(
    files: number,
    outcomes: number,
    format: 'csv' | 'txt' | 'xml',
    options: GenerateFileOptions = {}
) {
  const paths: string[] = [];
  const office = options.office ?? random(offices);

  for (let i = 1; i <= files; i++) {
    const suffix = options.suffix ?? `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const name = `crime_${suffix}_${i}`;

    const intermediate = format === 'xml' ? 'csv' : format;

    await generateFile(name, outcomes, intermediate, {
      ...options,
      office,
    });

    const csv = path.join(OUTPUT_DIR, `${name}.${intermediate}`);
    const xml = path.join(OUTPUT_DIR, `${name}.xml`);

    if (format === 'xml') {
      await convertFileToXml(csv, xml);
      fs.unlinkSync(csv);
      paths.push(xml);
    } else {
      paths.push(csv);
    }
  }

  return { filePaths: paths, office };
}
