import fs from 'fs';
import path from 'path';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import { convertFileToXml } from '../converter';
import { getUniqueSubmissionPeriod } from './submissionPeriodHelper';
import { claimOptions } from '../claimOptions';
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
    scheduleEnd?: string,
    claimOverride?: claimOptions,
    period?: string
) {
  const first = faker.person.firstName();
  const last = faker.person.lastName();

  let start = scheduleStart ? new Date(scheduleStart) : new Date('2017-02-02');
  let end = scheduleEnd ? new Date(scheduleEnd) : new Date('2018-12-31');
  // Convert period to Date (MMM-uuuu). Set end to last day of the month before the period month, to ensure generated dates are always within the period
  if (period) {
    const [monthStr, yearStr] = period.split('-');
    const month = new Date(`${monthStr} 1, ${yearStr}`).getMonth();
    const year = parseInt(yearStr, 10);
    end = new Date(year, month, 0); // Last day of the month
    // Go one month previous
    end = 
        new Date(end.getFullYear(), end.getMonth() - 1, end.getDate());
  }

  if (start < GLOBAL_MIN_CASE_DATE) start = new Date(GLOBAL_MIN_CASE_DATE);

  if (end <= start) {
    end = new Date(start);
    end.setMonth(end.getMonth() + 6);
  }

  const caseStart = faker.date.between({ from: start, to: end });
  const concluded = faker.date.between({ from: caseStart, to: end });

  const ufn = claimOverride?.ufn ?? makeUFN(caseStart, caseNum);
  const station = random(policeStations);

  const dob = faker.date.between({
    from: new Date('1960-01-01'),
    to: new Date('2005-12-31'),
  });

  return {
    client_forename: first,
    client_surname: last,
    client_date_of_birth: claimOverride?.clientDateOfBirth ?? dateFmt(dob),
    gender: random(['M', 'F']),
    ethnicity: random(['99', '01', '02', '03', '04']),
    profit_cost: claimOverride?.profitCost ?? money(10, 200),
    disbursements_amount: claimOverride?.disbursementAmount ?? money(0, 50),
    disbursements_vat: claimOverride?.disbursementVat ?? money(0, 1.98),
    vat_indicator: claimOverride?.vatApplicable ?? random(['Y', 'N']),
    travel_costs: claimOverride?.travelCost ?? money(0, 100),
    outcome_code: claimOverride?.outcomeCode ?? random(['CN04', 'CN02', 'CN01', 'CN08']),
    crime_matter_type: pad(Number(random(['1', '2', '3'])), 2),
    disability: random([
      'NCD', 'MOB', 'DEA', 'HEA', 'VIS', 'BLI', 'MHC', 'LDD', 'COG', 'ILL', 'OTH', 'UKN', 'PHY', 'SEN'
    ]),
    stage_reached_code: random(['INVC', 'PROD', 'PROK']),
    travel_waiting_costs: claimOverride?.travelWaitingCosts ?? money(0, 40),
    case_start_date: claimOverride?.caseStartDate ?? dateFmt(caseStart),
    rep_order_date: claimOverride?.repOrderDate ?? dateFmt(caseStart),
    work_concluded_date: claimOverride?.workConcludedDate ?? dateFmt(concluded),
    transfer_date: claimOverride?.transferDate ?? dateFmt(concluded),
    surgery_date: claimOverride?.surgeryDate ?? dateFmt(concluded),
    no_of_suspects: faker.number.int({ min: 1, max: 3 }),
    police_station: claimOverride?.policeStation ?? station.id,
    no_of_police_station: 1,
    duty_solicitor: claimOverride?.dutySolicitor ?? random(['Y', 'N']),
    youth_court: claimOverride?.youthCourt ?? random(['Y', 'N']),
    scheme_id: claimOverride?.schemeId ?? station.schemeId,
    dscc_number: dscc(),
    postal_application: claimOverride?.postalApplication ?? random(['Y', 'N']),
    nrm_advice: claimOverride?.nrmAdvice ?? random(['Y', 'N']),
    legacy_case: claimOverride?.legacyCase ?? random(['Y', 'N']),
    london_nonlondon_rate: claimOverride?.londonNonLondonRate ?? random(['Y', 'N']),
    additional_travel_payment: claimOverride?.additionalTravelPayment ?? random(['Y', 'N']),
    eligible_client_indicator: claimOverride?.eligibleClientIndicator ?? random(['Y', 'N']),
    irc_surgery: claimOverride?.ircSurgery ?? random(['Y', 'N']),
    substantive_hearing: claimOverride?.substantiveHearing ?? random(['Y', 'N']),
    tolerance_indicator: claimOverride?.toleranceIndicator ?? random(['Y', 'N']),
    client_legally_aided: claimOverride?.clientLegallyAided ?? random(['Y', 'N']),
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
    const o = options.claims?.[i];
    const base = await generateOutcome(office, i, scheduleStart, scheduleEnd, o, submissionPeriod ?? undefined);


    const feeCode = o?.feeCode ?? random(feeCodes);
    const matterType = feeCode.substring(0, 4);

    out +=
        `OUTCOME,` +
        `FEE_CODE=${feeCode},` +
        `matterType=${matterType},` +
        `UFN=${base.ufn},` +
        `CLIENT_FORENAME=${base.client_forename},` +
        `CLIENT_SURNAME=${base.client_surname},` +
        `CLIENT_DATE_OF_BIRTH=${base.client_date_of_birth},` +
        `GENDER=${base.gender},` +
        `ETHNICITY=${base.ethnicity},` +
        `DISABILITY=${base.disability},` +
        `CASE_START_DATE=${base.case_start_date},` +
        `PROFIT_COST=${base.profit_cost},` +
        `DISBURSEMENTS_AMOUNT=${base.disbursements_amount},` +
        `DISBURSEMENTS_VAT=${base.disbursements_vat},` +
        `VAT_INDICATOR=${base.vat_indicator},` +
        `TRAVEL_COSTS=${base.travel_costs},` +
        `OUTCOME_CODE=${base.outcome_code},` +
        `CRIME_MATTER_TYPE=${base.crime_matter_type},` +
        `TRAVEL_WAITING_COSTS=${base.travel_waiting_costs},` +
        `WORK_CONCLUDED_DATE=${base.work_concluded_date},` +
        `NO_OF_SUSPECTS=${base.no_of_suspects},` +
        `NO_OF_POLICE_STATION=${base.no_of_police_station},` +
        `POLICE_STATION=${base.police_station},` +
        `DUTY_SOLICITOR=${base.duty_solicitor},` +
        `YOUTH_COURT=${base.youth_court},` +
        `SCHEME_ID=${base.scheme_id},` +
        `DSCC_NUMBER=${base.dscc_number},` +
        `POSTAL_APPL_ACCP=${base.postal_application}, `+
        `NATIONAL_REF_MECHANISM_ADVICE=${base.nrm_advice}, `+
        `LEGACY_CASE=${base.legacy_case}, ` +
        `LONDON_NONLONDON_RATE=${base.london_nonlondon_rate}, `+
        `ADDITIONAL_TRAVEL_PAYMENT=${base.additional_travel_payment}, ` +
        `ELIGIBLE_CLIENT_INDICATOR=${base.eligible_client_indicator}, ` +
        `IRC_SURGERY=${base.irc_surgery}, ` +
        `SUBSTANTIVE_HEARING=${base.substantive_hearing}, `+
        `TOLERANCE_INDICATOR=${base.tolerance_indicator}, `+
        `DUTY_SOLICITOR=${base.duty_solicitor}, ` +
        `YOUTH_COURT=${base.youth_court}, ` +
        `REP_ORDER_DATE=${base.rep_order_date}, ` +
        `TRANSFER_DATE=${base.transfer_date}, ` +
        `SURGERY_DATE=${base.surgery_date}, ` +
        `CLIENT_LEGALLY_AIDED=${base.client_legally_aided}\n`;
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
