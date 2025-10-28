import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { faker } from '@faker-js/faker';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
dotenv.config();

// ---------- 1️⃣ Database Setup ----------
const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
    synchronize: false,
});

// ---------- 2️⃣ Config ----------
const offices = ['0P322F'];
const feeCodes = ['ASSA'];
const OUTPUT_DIR = "generated_submissions_mediation";
const PROVIDER_API = process.env.PROVIDER_API || 'https://laa-provider-details-api-uat.apps.live.cloud-platform.service.justice.gov.uk/api/v1/provider-offices';
const MIN_CASE_START = new Date('2014-01-01');
const MAX_CASE_START = new Date('2024-12-31');

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

// ---------- 4️⃣ DB Submission Check ----------
async function isSubmissionPeriodUsed(areaOfLaw: string, submissionPeriod: string, office: string): Promise<boolean> {
    const result = await AppDataSource.query(
        `SELECT 1 
         FROM claims.submission 
         WHERE area_of_law = $1 
           AND submission_period = $2 
           AND office_account_number = $3 
           AND status = 'VALIDATION_SUCCEEDED'
         LIMIT 1`,
        [areaOfLaw, submissionPeriod, office]
    );
    return result.length > 0;
}

const generateUniqueSubmissionPeriod = async (office: string): Promise<string> => {
    const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    let period: string;
    let attempts = 0;

    do {
        const submissionDate = faker.date.between({ from: MIN_CASE_START, to: MAX_CASE_START });
        period = `${months[submissionDate.getMonth()]}-${submissionDate.getFullYear()}`;
        attempts++;
        if (attempts > 50) throw new Error(`Cannot find unique submission period for office ${office}`);
    } while (await isSubmissionPeriodUsed('MEDIATION', period, office));

    return period;
};

// ---------- 5️⃣ Provider API Check ----------
const fetchProviderSchedules = async (office: string, caseStartDate: Date) => {
    const formattedDate = caseStartDate.toISOString().split('T')[0];
    try {
        const response = await axios.get(`${PROVIDER_API}/${office}/schedules?effectiveDate=${formattedDate}&areaOfLaw=MEDIATION`, {
            headers: {
                accept: 'application/json',
                'X-Authorization': process.env.PROVIDER_API_KEY || 'dpd_e42*u+gb6@rp8qNmccvDUd'
            },
            validateStatus: () => true
        });
        if (response.status === 204) return null;
        return response.data.schedules;
    } catch (err) {
        console.error('Error fetching provider schedules:', err);
        return null;
    }
};

// ---------- 6️⃣ Outcome Generator ----------
const generateOutcome = async (office: string, caseNum: number) => {
    const client1First = faker.name.firstName();
    const client1Last = faker.name.lastName();
    const client2First = faker.name.firstName();
    const client2Last = faker.name.lastName();
    const dob1 = faker.date.between({ from: new Date('1950-01-01'), to: new Date('2000-12-31') });
    const dob2 = faker.date.between({ from: new Date('1950-01-01'), to: new Date('2000-12-31') });

    let caseStartDate: Date | null = null;
    for (let attempt = 0; attempt < 50; attempt++) {
        const candidateDate = faker.date.between({ from: MIN_CASE_START, to: MAX_CASE_START });
        const schedules = await fetchProviderSchedules(office, candidateDate);
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

    if (!caseStartDate) throw new Error(`Unable to generate valid case start date for office ${office}`);

    const medConcluded = faker.date.between({ from: caseStartDate, to: new Date() });
    const workConcluded = faker.date.between({ from: caseStartDate, to: medConcluded });
    const ufn = generateUFN(caseStartDate, caseNum);

    return {
        case_ref_number: faker.number.int({ min: 1000, max: 9999 }),
        case_start_date: formatDate(caseStartDate),
        case_id: pad(caseNum, 3),
        ufn,
        client1_first: client1First,
        client1_last: client1Last,
        client1_dob: formatDate(dob1),
        client1_gender: randomFrom(['M','F']),
        client1_ethnicity: '01',
        client1_disability: randomFrom(['NCD','ILL']),
        client1_postcode: faker.helpers.replaceSymbols('??## #??').toUpperCase(),
        client1_legally_aided: randomFrom(['Y','N']),
        client2_first: client2First,
        client2_last: client2Last,
        client2_dob: formatDate(dob2),
        client2_gender: randomFrom(['M','F']),
        client2_ethnicity: '01',
        client2_disability: randomFrom(['NCD','ILL']),
        client2_postcode: faker.helpers.replaceSymbols('??## #??').toUpperCase(),
        client2_legally_aided: randomFrom(['Y','N']),
        med_concluded_date: formatDate(medConcluded),
        work_concluded_date: formatDate(workConcluded),
        outcome_code: 'B',
        number_of_sessions: faker.number.int({ min: 1, max: 5 }),
        mediation_time: faker.number.int({ min: 60, max: 240 }),
        fee_code: randomFrom(feeCodes)
    };
};

// ---------- 7️⃣ File Generator ----------
const generateFile = async (fileName: string, outcomesCount: number, fileType: 'txt' | 'csv') => {
    const office = randomFrom(offices);
    const submissionPeriod = await generateUniqueSubmissionPeriod(office);

    let content = `OFFICE,account=${office}\n`;
    content += `SCHEDULE,submissionPeriod=${submissionPeriod},areaOfLaw=MEDIATION,scheduleNum=${office}/MEDI${submissionPeriod.replace('-','')}/01\n`;

    for (let i = 1; i <= outcomesCount; i++) {
        const o = await generateOutcome(office, i);
        content += `OUTCOME,FEE_CODE=${o.fee_code},matterType=MEDI:MDCS,CASE_START_DATE=${o.case_start_date},CASE_ID=${o.case_id},UFN=${o.ufn},CLIENT_FORENAME=${o.client1_first},CLIENT_SURNAME=${o.client1_last},CLIENT_DATE_OF_BIRTH=${o.client1_dob},UCN=${o.ufn},GENDER=${o.client1_gender},ETHNICITY=${o.client1_ethnicity},DISABILITY=${o.client1_disability},CLIENT_POST_CODE=${o.client1_postcode},CLIENT_LEGALLY_AIDED=${o.client1_legally_aided},CLIENT2_FORENAME=${o.client2_first},CLIENT2_SURNAME=${o.client2_last},CLIENT2_DATE_OF_BIRTH=${o.client2_dob},CLIENT2_GENDER=${o.client2_gender},CLIENT2_ETHNICITY=${o.client2_ethnicity},CLIENT2_DISABILITY=${o.client2_disability},CLIENT2_POST_CODE=${o.client2_postcode},CLIENT2_LEGALLY_AIDED=${o.client2_legally_aided},MED_CONCLUDED_DATE=${o.med_concluded_date},WORK_CONCLUDED_DATE=${o.work_concluded_date},NUMBER_OF_MEDIATION_SESSIONS=${o.number_of_sessions},MEDIATION_TIME=${o.mediation_time},CASE_REF_NUMBER=${o.case_ref_number},OUTCOME_CODE=${o.outcome_code},POSTAL_APPL_ACCP=Y,CLIENT2_POSTAL_APPL_ACCP=N,SCHEDULE_REF=${office}/MEDI${submissionPeriod.replace('-','')}/01\n`;
    }

    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);
    fs.writeFileSync(path.join(OUTPUT_DIR, `${fileName}.${fileType}`), content, 'utf-8');
    console.log(`✅ Generated ${fileName}.${fileType} with ${outcomesCount} outcomes for office ${office}`);
};

// ---------- 8️⃣ CLI Runner ----------
const argv = yargs(hideBin(process.argv))
    .option('files', { type: 'number', default: 1 })
    .option('outcomes', { type: 'number', default: 1 })
    .option('format', { type: 'string', default: 'txt', choices: ['txt','csv'] })
    .parseSync();

// ---------- 9️⃣ Main Execution ----------
(async () => {
    try {
        await AppDataSource.initialize();
        console.log('✅ Database connection established');

        for (let i = 1; i <= argv.files; i++) {
            await generateFile(`mediation_submission_${i}`, argv.outcomes, argv.format as 'txt' | 'csv');
        }

        console.log(`\n🎉 Completed. Files saved in: ${OUTPUT_DIR}/`);
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await AppDataSource.destroy();
        console.log('🔒 Database connection closed');
    }
})();
