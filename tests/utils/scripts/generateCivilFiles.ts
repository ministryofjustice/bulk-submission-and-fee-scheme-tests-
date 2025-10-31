import { getUniqueSubmissionPeriod } from './submissionPeriodHelper';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { faker } from '@faker-js/faker';

import { convertFileToXml } from './converter';
import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

// ---------- 1️⃣ Setup ----------
let providerApiAvailable = true;

// ---------- 2️⃣ Config ----------
const offices = ['0P322F'];
const feeCodes = ['CAPA','COM'];
const OUTPUT_DIR = "generated_submissions_legal";
const PROVIDER_API = process.env.PROVIDER_API || 'https://laa-provider-details-api-uat.apps.live.cloud-platform.service.justice.gov.uk/api/v1/provider-offices';

// ---------- 3️⃣ Helpers ----------
const pad = (num: number, len = 2) => num.toString().padStart(len, "0");
const randomFrom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomMoney = (min: number, max: number) => faker.number.float({ min, max, fractionDigits: 2 });
const formatDate = (date: Date) => date.toISOString().split('T')[0].split('-').reverse().join('/');
const sanitizeForCode = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

const generateUFN = (date: Date, caseNum: number) => {
    const dd = pad(date.getDate());
    const mm = pad(date.getMonth() + 1);
    const yy = String(date.getFullYear()).slice(-2);
    const nnn = pad(caseNum, 3);
    return `${dd}${mm}${yy}/${nnn}`;
};

const generateUCN = (dob: Date, surname: string, initial: string) => {
    const dd = pad(dob.getDate());
    const mm = pad(dob.getMonth() + 1);
    const yyyy = dob.getFullYear();
    return `${dd}${mm}${yyyy}/${initial}/${sanitizeForCode(surname.slice(0, 3))}`;
};

// ---------- 5️⃣ Provider API Check ----------
const fetchProviderSchedules = async (office: string, caseStartDate: Date) => {
    if (!providerApiAvailable) return undefined;

    const formattedDate = caseStartDate.toISOString().split('T')[0];
    try {
        const response = await axios.get(`${PROVIDER_API}/${office}/schedules?effectiveDate=${formattedDate}&areaOfLaw=LEGAL%20HELP`, {
            headers: {
                accept: 'application/json',
                'X-Authorization': process.env.PROVIDER_API_KEY || 'dpd_e42*u+gb6@rp8qNmccvDUd'
            },
            validateStatus: () => true // don't throw on non-200
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

// ---------- 6️⃣ Outcome Generator ----------
const generateOutcome = async (office: string, caseNum: number, submissionYear: number) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const dob = faker.date.between({ from: new Date('1960-01-01'), to: new Date('2005-12-31') });

    const minCaseStart = new Date(Math.max(dob.getFullYear() + 18, 2018), 0, 1);
    const maxCaseStart = new Date(2024, 11, 31);

    let caseStartDate: Date | null = null;

    for (let attempt = 0; attempt < 100; attempt++) {
        const candidateDate = faker.date.between({ from: minCaseStart, to: maxCaseStart });
        const schedules = await fetchProviderSchedules(office, candidateDate);
        if (schedules === undefined) {
            caseStartDate = candidateDate;
            break;
        }
        if (!schedules || schedules.length === 0) continue;

        // @ts-ignore
        const validSchedule = schedules.find(s => {
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
        caseStartDate = faker.date.between({ from: minCaseStart, to: maxCaseStart });
        console.warn(`ℹ️ Using locally generated case start date for office ${office}`);
    }

    const workConcludedDate = faker.date.between({ from: caseStartDate, to: new Date() });
    const ufn = generateUFN(caseStartDate, caseNum);
    const ucn = generateUCN(dob, lastName, firstName[0]);
    const postcode = faker.helpers.replaceSymbols('??## #??').toUpperCase();

    return {
        case_ref_number: `${sanitizeForCode(firstName.slice(0,3))}/${sanitizeForCode(lastName)}`,
        case_start_date: formatDate(caseStartDate),
        case_id: pad(caseNum, 3),
        ufn,
        client_forename: firstName,
        client_surname: lastName,
        client_date_of_birth: formatDate(dob),
        ucn,
        gender: randomFrom(['M','F']),
        ethnicity: '12',
        disability: 'NCD',
        profit_cost: randomMoney(50, 200),
        disbursements_amount: randomMoney(0, 20),
        disbursements_vat: randomMoney(0, 1.98),
        counsel_cost: randomMoney(0, 50),
        travel_costs: randomMoney(0, 15),
        work_concluded_date: formatDate(workConcludedDate),
        advice_time: 120,
        travel_time: 0,
        waiting_time: 0,
        vat_indicator: 'Y',
        london_nonlondon_rate: 'N',
        outcome_code: 'FX',
        schedule_ref: `${office}/${submissionYear}/${caseNum}`,
        client_post_code: postcode
    };
};

// ---------- 7️⃣ File Generator ----------
const generateFile = async (fileName: string, outcomesCount: number, fileType: 'txt' | 'csv') => {
    const office = randomFrom(offices);
    const submissionPeriod = await getUniqueSubmissionPeriod(office, 'LEGAL HELP');
    const submissionYear = parseInt(submissionPeriod.split('-')[1]);

    let content = `OFFICE,account=${office}\n`;
    content += `SCHEDULE,submissionPeriod=${submissionPeriod},areaOfLaw=LEGAL HELP,scheduleNum=${office}/CIVIL\n`;

    for (let i = 1; i <= outcomesCount; i++) {
        const o = await generateOutcome(office, i, submissionYear);
        const feeCode = randomFrom(feeCodes);

        content += `OUTCOME,FEE_CODE=${feeCode},matterType=FAMX:FAPP,CASE_REF_NUMBER=${o.case_ref_number},CASE_START_DATE=${o.case_start_date},CASE_ID=${o.case_id},UFN=${o.ufn},PROCUREMENT_AREA=PA00120,ACCESS_POINT=AP00000,CLIENT_FORENAME=${o.client_forename},CLIENT_SURNAME=${o.client_surname},CLIENT_DATE_OF_BIRTH=${o.client_date_of_birth},UCN=${o.ucn},GENDER=${o.gender},ETHNICITY=${o.ethnicity},DISABILITY=${o.disability},CLIENT_POST_CODE=${o.client_post_code},WORK_CONCLUDED_DATE=${o.work_concluded_date},CASE_STAGE_LEVEL=FPC01,ADVICE_TIME=${o.advice_time},TRAVEL_TIME=${o.travel_time},WAITING_TIME=${o.waiting_time},PROFIT_COST=${o.profit_cost},DISBURSEMENTS_AMOUNT=${o.disbursements_amount},COUNSEL_COST=${o.counsel_cost},DISBURSEMENTS_VAT=${o.disbursements_vat},TRAVEL_WAITING_COSTS=0.00,VAT_INDICATOR=${o.vat_indicator},LONDON_NONLONDON_RATE=${o.london_nonlondon_rate},TRAVEL_COSTS=${o.travel_costs},OUTCOME_CODE=${o.outcome_code},POSTAL_APPL_ACCP=N,SCHEDULE_REF=${o.schedule_ref}\n`;
    }

    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);
    fs.writeFileSync(path.join(OUTPUT_DIR, `${fileName}.${fileType}`), content, 'utf-8');
    console.log(`✅ Generated ${fileName}.${fileType} with ${outcomesCount} outcomes for office ${office}`);
};


export async function GenerateCivilFile(
    files: number,
    outcomes: number,
    format: 'txt' | 'csv' | 'xml',
    suffix?: string
) {
    const generatedFiles: string[] = [];

    try {
        for (let i = 1; i <= files; i++) {
            const uniquePart = suffix || `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
            const baseName = `legal_${uniquePart}_${i}`;
            const intermediateFormat = format === 'xml' ? 'csv' : format;

            const inputFile = path.join(OUTPUT_DIR, `${baseName}.${intermediateFormat}`);
            const outputFile = path.join(OUTPUT_DIR, `${baseName}.xml`);

            // Generate the base file
            await generateFile(baseName, outcomes, intermediateFormat);
            console.log(`🧾 File generated: ${inputFile}`);

            if (format === 'xml') {
                // ✅ Convert CSV to XML
                await convertFileToXml(inputFile, outputFile);
                console.log(`✅ Converted to XML: ${outputFile}`);

                // 🧹 Remove the temporary CSV file
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
