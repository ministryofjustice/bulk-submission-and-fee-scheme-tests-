import fs from 'fs';
import path from 'path';
import { faker } from '@faker-js/faker';
import { convertFileToXml } from '../converter';
import dotenv from 'dotenv';
import { claimOptions } from '../claimOptions';
import { GenerateFileOptions } from './generateFileOptions';
import { getUniqueSubmissionPeriod } from './submissionPeriodHelper';

dotenv.config();

// ------------------------------
// CONFIG
// ------------------------------
const offices = ['0P322F', '2L847Q', '2N199K', '2P746R', '1T102C'];
const feeCodes = ['CAPA', 'COM'];
const OUTPUT_DIR = 'generated_submissions_legal';

const pad = (n: number, len = 2) => n.toString().padStart(len, '0');
const random = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const money = (min: number, max: number) =>
    faker.number.float({ min, max, fractionDigits: 2 });
const fmt = (d: Date) =>
    d.toISOString().split('T')[0].split('-').reverse().join('/');
const clean = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

const makeUFN = (d: Date, caseNum: number) =>
    `${pad(d.getDate())}${pad(d.getMonth() + 1)}${String(d.getFullYear()).slice(-2)}/${pad(caseNum, 3)}`;

const makeUCN = (dob: Date, surname: string, initial: string) =>
    `${pad(dob.getDate())}${pad(dob.getMonth() + 1)}${dob.getFullYear()}/${initial}/${clean(surname).slice(0, 3)}`;

// ------------------------------
// OUTCOME GENERATOR
// ------------------------------
async function generateOutcome(
    office: string,
    caseNum: number,
    scheduleStart?: string,
    scheduleEnd?: string,
    claimOverride?: claimOptions
) {
  const first = faker.person.firstName();
  const last = faker.person.lastName();

  let start = scheduleStart ? new Date(scheduleStart) : new Date('1995-01-01');
  let end = scheduleEnd ? new Date(scheduleEnd) : new Date();

  const MIN = new Date('1995-01-01');
  const today = new Date();

  if (start < MIN) start = MIN;
  if (end > today) end = today;

  if (end <= start) {
    end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    if (end > today) end = today;
  }

  const caseStart = faker.date.between({ from: start, to: end });
  const concluded = faker.date.between({ from: caseStart, to: end });

  const dob = faker.date.between({
    from: new Date('1960-01-01'),
    to: new Date('2005-12-31'),
  });

  const repOrder = faker.date.between({
    from: new Date('2016-04-01'),
    to: end,
  });

  return {
    case_ref_number: `${clean(first.slice(0, 3))}/${clean(last)}`,
    case_start_date: claimOverride?.caseStartDate ?? fmt(caseStart),
    case_id: pad(caseNum, 3),
    ufn: claimOverride?.ufn ?? makeUFN(caseStart, caseNum),

    client_forename: first,
    client_surname: last,
    client_date_of_birth: claimOverride?.clientDateOfBirth ?? fmt(dob),
    eligible_client_indicator: claimOverride?.eligibleClientIndicator ?? 'Y',
    ucn: claimOverride?.ucn ?? makeUCN(dob, last, first[0]),

    gender: random(['M', 'F']),
    ethnicity: '12',
    disability: 'NCD',

    profit_cost: claimOverride?.profitCost ?? money(50, 200),
    disbursements_amount: claimOverride?.disbursementAmount ?? money(0, 20),
    disbursements_vat: claimOverride?.disbursementVat ?? money(0, 1.98),
    counsel_cost: 19.33,
    travel_costs: 5.86,

    work_concluded_date: claimOverride?.workConcludedDate ?? fmt(concluded),
    transfer_date: claimOverride?.transferDate ?? fmt(concluded),
    surgery_date: claimOverride?.surgeryDate ?? fmt(concluded),

    /** ✅ NEW FIELD */
    rep_order_date: claimOverride?.repOrderDate ?? fmt(repOrder),

    advice_time: 120,
    travel_time: 0,
    waiting_time: 0,

    vat_applicable: claimOverride?.vatApplicable ?? 'Y',
    london_nonlondon_rate: claimOverride?.londonNonLondonRate ?? 'N',

    outcome_code: 'FX',
    postal_application: claimOverride?.postalApplication ?? 'Y',
    nrm_advice: claimOverride?.nrmAdvice ?? 'Y',

    schedule_ref: `${office}/${new Date().getFullYear()}/${caseNum}`,
    client_post_code: faker.helpers.replaceSymbols('??## #??').toUpperCase(),

    legacy_case: claimOverride?.legacyCase ?? 'N',
    additional_travel_payment: claimOverride?.additionalTravelPayment ?? 'N',
    irc_surgery: claimOverride?.ircSurgery ?? 'N',
    substantive_hearing: claimOverride?.substantiveHearing ?? 'N',
    tolerance_indicator: claimOverride?.toleranceIndicator ?? 'N',
  };
}

// ------------------------------
// FILE GENERATOR
// ------------------------------
async function generateFile(
    base: string,
    count: number,
    ext: 'txt' | 'csv',
    office: string,
    claims?: claimOptions[]
) {
  const { period, scheduleStart, scheduleEnd } =
      await getUniqueSubmissionPeriod(office, 'LEGAL HELP');

  let out = `OFFICE,account=${office}\n`;
  out += `SCHEDULE,submissionPeriod=${period},areaOfLaw=LEGAL HELP,scheduleNum=${office}/CIVIL\n`;

  for (let i = 0; i < count; i++) {
    const override = claims?.[i];
    const baseRow = await generateOutcome(
        office,
        i,
        scheduleStart,
        scheduleEnd,
        override
    );

    const feeCode = override?.feeCode ?? random(feeCodes);

    out +=
        `OUTCOME,` +
        `FEE_CODE=${feeCode},` +
        `matterType=FAMX:FAPP,` +
        `CASE_REF_NUMBER=${baseRow.case_ref_number},` +
        `CASE_START_DATE=${baseRow.case_start_date},` +
        `CASE_ID=${baseRow.case_id},` +
        `UFN=${baseRow.ufn},` +
        `PROCUREMENT_AREA=PA00120,` +
        `ACCESS_POINT=AP00000,` +
        `CLIENT_FORENAME=${baseRow.client_forename},` +
        `CLIENT_SURNAME=${baseRow.client_surname},` +
        `CLIENT_DATE_OF_BIRTH=${baseRow.client_date_of_birth},` +
        `UCN=${baseRow.ucn.toUpperCase()},` +
        `GENDER=${baseRow.gender},` +
        `ETHNICITY=${baseRow.ethnicity},` +
        `DISABILITY=${baseRow.disability},` +
        `CLIENT_POST_CODE=${baseRow.client_post_code},` +
        `WORK_CONCLUDED_DATE=${baseRow.work_concluded_date},` +
        `CASE_STAGE_LEVEL=FPC01,` +
        `ADVICE_TIME=${baseRow.advice_time},` +
        `TRAVEL_TIME=${baseRow.travel_time},` +
        `WAITING_TIME=${baseRow.waiting_time},` +
        `PROFIT_COST=${baseRow.profit_cost},` +
        `DISBURSEMENTS_AMOUNT=${baseRow.disbursements_amount},` +
        `COUNSEL_COST=${baseRow.counsel_cost},` +
        `DISBURSEMENTS_VAT=${baseRow.disbursements_vat},` +
        `TRAVEL_WAITING_COSTS=0.00,` +
        `VAT_INDICATOR=${baseRow.vat_applicable},` +
        `LONDON_NONLONDON_RATE=${baseRow.london_nonlondon_rate},` +
        `TRAVEL_COSTS=${baseRow.travel_costs},` +
        `OUTCOME_CODE=${baseRow.outcome_code},` +
        `POSTAL_APPL_ACCP=${baseRow.postal_application},` +
        `NATIONAL_REF_MECHANISM_ADVICE=${baseRow.nrm_advice},` +
        `LEGACY_CASE=${baseRow.legacy_case},` +
        `ADDITIONAL_TRAVEL_PAYMENT=${baseRow.additional_travel_payment},` +
        `ELIGIBLE_CLIENT_INDICATOR=${baseRow.eligible_client_indicator},` +
        `IRC_SURGERY=${baseRow.irc_surgery},` +
        `SUBSTANTIVE_HEARING=${baseRow.substantive_hearing},` +
        `TOLERANCE_INDICATOR=${baseRow.tolerance_indicator},` +
        `SURGERY_DATE=${baseRow.surgery_date},` +
        `REP_ORDER_DATE=${baseRow.rep_order_date},` +
        `TRANSFER_DATE=${baseRow.transfer_date},` +
        `SCHEDULE_REF=${baseRow.schedule_ref}\n`;
  }

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

  fs.writeFileSync(path.join(OUTPUT_DIR, `${base}.${ext}`), out, 'utf-8');
}

// ------------------------------
// PUBLIC EXPORT
// ------------------------------
export async function GenerateCivilFile(
    files: number,
    outcomes: number,
    format: 'txt' | 'csv' | 'xml',
    opts: GenerateFileOptions = {}
) {
  const paths: string[] = [];
  const office = opts.office ?? random(offices);

  for (let i = 1; i <= files; i++) {
    const suffix =
        opts.suffix ?? `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const name = `legal_${suffix}_${i}`;

    const inter = format === 'xml' ? 'csv' : format;

    await generateFile(name, outcomes, inter, office, opts.claims);

    const csv = path.join(OUTPUT_DIR, `${name}.${inter}`);
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
