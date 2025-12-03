import {Given, When} from '@cucumber/cucumber';
import type {CustomWorld} from '../../support/world';
import {GenerateCivilFile} from '../../../utils/scripts/dataGenartor/generateCivilFiles';
import {GenerateMediationFiles} from '../../../utils/scripts/dataGenartor/generateMediationFiles';
import {GenerateCrimeFiles} from '../../../utils/scripts/dataGenartor/generateCrimeFiles';
import {generateMatterStartsFile} from '../../../utils/scripts/dataGenartor/generateMatterStartsFile';
import {claimOptions} from '../../../utils/scripts/claimOptions';
import path from 'path';
import {BulkImportPage} from '../../../pages/bulkImportPage';
import FormData from 'form-data';
import fs from 'fs';
import {getSubmissionPeriod} from "../../../utils/scripts/dataGenartor/submissionPeriodHelper";
import { GenerateFixedCrimePoliceFile } from '../../../utils/scripts/dataGenartor/generateFixedCrimeFiles';
import {GenerateMediationFilesOverride} from "../../../utils/scripts/dataGenartor/genarateMediationFilesWithOverides";
import {GenerateCivilFilesOverride} from "../../../utils/scripts/dataGenartor/generateCivilFilesWithOverides";
import {
    GenerateTwoLegalHelpFiles
} from "../../../utils/scripts/dataGenartor/GenerateTwoCivilFilesForPeriods";
import {GenerateSingleLegalHelpFile} from "../../../utils/scripts/dataGenartor/generateSingleLegalHelpFile";



function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** --- Helper to support BOTH old and new generator return shapes --- */
type GenReturn =
    | string[]
    | { filePaths: string[]; office?: string; submissionPeriod?: string };

function normalizeGeneratorResult(
    res: GenReturn,
    fallbackOffice?: string
): { filePaths: string[]; office?: string } {
    if (Array.isArray(res)) {
        return { filePaths: res, office: fallbackOffice };
    }
    return { filePaths: res.filePaths, office: res.office ?? fallbackOffice };
}

function pickOffice(world: CustomWorld, explicit?: string) {
    return explicit || world.officeAccount || process.env.DEFAULT_TEST_OFFICE || '0P322F';
}

//
// ======================================================
// 🔥 UNIVERSAL POLLING FUNCTION (used by both API steps)
// ======================================================
async function pollSubmissionUntilTerminal(world: CustomWorld, submissionId: string, office: string) {
    const dstewbaseUrl = process.env.DSTEW_API_BASE_URL;
    const dstewToken = process.env.DSTEW_API_TOKEN;

    const maxRetries = 240; // ~3 minutes at 3s interval
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    const terminalStates = ["VALIDATION_SUCCEEDED", "VALIDATION_FAILED"];

    for (let attempt = 1; attempt <= maxRetries; attempt++) {

        const resp = await world.client.get(
            `${dstewbaseUrl}/api/v0/submissions?offices=${office}&submission_id=${submissionId}&page=0&size=20`,
            {
                headers: {
                    accept: 'application/json',
                    Authorization: dstewToken,
                },
            }
        );

        const submission = resp.data.content?.[0];
        const status = submission?.status || 'UNKNOWN';
        const submissionPeriod = submission?.submission_period || '';

        await world.attach(`Attempt ${attempt}: current status = ${status} (${submissionPeriod})`, 'text/plain');

        if (terminalStates.includes(status)) {

            if (status === "VALIDATION_SUCCEEDED") {
                world.submissionPeriod = submissionPeriod;
                world.officeAccount = office;
                await world.attach(`✅ Submission validated successfully: ${submissionId}`, 'text/plain');
                return;
            }

            if (status === "VALIDATION_FAILED") {
                await world.attach(`❌ Submission validation FAILED: ${submissionId}`, 'text/plain');
                throw new Error(`VALIDATION_FAILED: ${submissionId}`);
            }
        }

        await delay(3000);
    }

    throw new Error(`❌ Submission never reached a terminal state after ${maxRetries} attempts.`);
}

//
// ======================================================
//                  GENERATION STEPS
// ======================================================
Given(
    'I generate {string} {string} file with {string} outcomes',
    async function (this: CustomWorld, areaOfLaw, format, outcomes) {
        const files = 1;
        const totalOutcomes = Number(outcomes);

        const safeScenario = (this.currentScenarioName || 'Scenario')
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '');
        const uniqueSuffix = `${safeScenario}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

        let result: GenReturn;

        switch (areaOfLaw) {
            case 'Legal help':
                result = await GenerateCivilFile(files, totalOutcomes, format as any, { suffix: uniqueSuffix });
                break;
            case 'Mediation':
                result = await GenerateMediationFiles(files, totalOutcomes, format as any, { suffix: uniqueSuffix });
                break;
            case 'Crime lower':
                result = await GenerateCrimeFiles(files, totalOutcomes, format as any, { suffix: uniqueSuffix });
                break;
            default:
                throw new Error(`Invalid area of law :${areaOfLaw}`);
        }

        const { filePaths, office } = normalizeGeneratorResult(result);
        const filePath = filePaths.find((f) => f.includes(uniqueSuffix)) || filePaths[0];
        const fileName = path.basename(filePath);

        this.fileName = fileName;
        this.generatedFilePath = filePath;
        this.officeAccount = office || this.officeAccount;

        await this.attach(`📁 Generated file for upload: ${fileName}`, 'text/plain');
        if (this.officeAccount) await this.attach(`🏢 Office: ${this.officeAccount}`, 'text/plain');
    }
);

When(
    'I generate {string} {string} with all matter type file',
    async function (this: CustomWorld, areaOfLaw: string, format: string) {
        const result = await generateMatterStartsFile(areaOfLaw, format, '', 1, { includeAllCodes: true });

        this.fileName = result.fileName;
        this.generatedFilePath = result.filePath;
        this.matterStartCounts = result.counts;
        this.submissionPeriod = result.submissionPeriod;
        this.officeAccount = result.officeAccount || this.officeAccount;

        await this.attach(`📝 Generated matter starts file (all codes): ${result.fileName}`, 'text/plain');
        if (this.officeAccount) await this.attach(`🏢 Office: ${this.officeAccount}`, 'text/plain');
        await this.attach(
            `🗓 Submission period: ${result.submissionPeriod}\n📄 Schedule ref: ${result.scheduleRef}`,
            'text/plain'
        );
    }
);

Given('I generate {string} {string} file with the following claims', async function (this: CustomWorld, areaOfLaw, format, dataTable) {

    const claims = dataTable.hashes();

    // Extract office if provided in the first row
    const officeOverride = claims[0].office ?? undefined;

    let result: GenReturn;

    switch (areaOfLaw) {
        case "Legal help":
            result = await GenerateCivilFilesOverride(
                1,
                claims.length,
                format as any,
                {
                    claims,
                    office: officeOverride   // ⭐ PASS THE OFFICE HERE
                }
            );
            break;

        case "Mediation":
            result = await GenerateMediationFilesOverride(
                1,
                claims.length,
                format as any,
                {
                    claims,
                    office: officeOverride   // ⭐ PASS THE OFFICE HERE
                }
            );
            break;

        case "Crime lower":
            result = await GenerateCrimeFiles(1, claims.length, format as any, { claims });
            break;

        case "Crime":
            const fixed = await GenerateFixedCrimePoliceFile("crime_fixed");
            result = { filePaths: [fixed.filePath], office: fixed.office };
            break;

        default:
            throw new Error(`Invalid area of law: ${areaOfLaw}`);
    }

    const { filePaths, office } = normalizeGeneratorResult(result);
    const filePath = filePaths[0];

    this.fileName = path.basename(filePath);
    this.generatedFilePath = filePath;
    this.filePath = filePath;

    // Save office for future duplicate logic
    this.officeAccount = officeOverride ?? office;

    await this.attach(`📁 Generated file: ${this.fileName}`, "text/plain");
    await this.attach(`🏢 Office: ${this.officeAccount}`, "text/plain");
});

Given('I generate {string} {string} file with the following claims from period {string}', async function (this: CustomWorld, areaOfLaw, format, submissionPeriod, dataTable) {
    const claims: claimOptions[] = dataTable.hashes();

    for (let i = 0; i < claims.length; i++) {
        console.log(`➕Claim to add ${i}: ${claims[i].ucn}, ${claims[i].ufn}, ${claims[i].feeCode}`);
    }

    if (this.currentSubmissionMonth && submissionPeriod) {
        submissionPeriod = getSubmissionPeriod(submissionPeriod);
    }

    let result: GenReturn;
    switch (areaOfLaw) {
        case "Legal help" :
            result = await GenerateCivilFile(1, claims.length, format as any, {submissionPeriod,claims})
            break
        case "Mediation" :
            result = await GenerateMediationFiles(1, claims.length, format as any, {submissionPeriod,claims})
            break
        case "Crime lower" :
            result = await GenerateCrimeFiles(1, claims.length, format as any, {submissionPeriod,claims})
            break
        default : {
            throw new Error(`Invalid area of law :${areaOfLaw}`)
        }
    }

    const { filePaths, office } = normalizeGeneratorResult(result);
    const filePath = filePaths[0];
    const fileName = path.basename(filePath);

    this.fileName = fileName;
    this.generatedFilePath = filePath;
    this.officeAccount = office || this.officeAccount;

    await this.attach(`📁 Generated file for upload: ${fileName}`, 'text/plain');
    if (this.officeAccount) await this.attach(`🏢 Office: ${this.officeAccount}`, 'text/plain');
});

Given('I generate {string} {string} file with the following claims from period {string} with office {string}', async function (this: CustomWorld, areaOfLaw, format, submissionPeriod, office, dataTable) {
    const claims: claimOptions[] = dataTable.hashes();

    for (let i = 0; i < claims.length; i++) {
        console.log(`➕Claim to add ${i}: ${claims[i].ucn}, ${claims[i].ufn}, ${claims[i].feeCode}`);
    }

    let result: GenReturn;
    switch (areaOfLaw) {
        case "Legal help" :
            result = await GenerateCivilFile(1, claims.length, format as any, {submissionPeriod,office, claims})
            break
        case "Mediation" :
            result = await GenerateMediationFiles(1, claims.length, format as any, {submissionPeriod,office, claims})
            break
        case "Crime lower" :
            result = await GenerateCrimeFiles(1, claims.length, format as any, {submissionPeriod,office, claims})
            break
        default : {
            throw new Error(`Invalid area of law :${areaOfLaw}`)
        }
    }

    const norm = normalizeGeneratorResult(result, office);
    const filePath = norm.filePaths[0];
    const fileName = path.basename(filePath);

    this.fileName = fileName;
    this.generatedFilePath = filePath;
    this.officeAccount = norm.office || office;

    await this.attach(`📁 Generated file for upload: ${fileName}`, 'text/plain');
    if (this.officeAccount) await this.attach(`🏢 Office: ${this.officeAccount}`, 'text/plain');
});

// duplicate step kept intact
Given('I generate {string} {string} file with the following claims from period {string} with office {string}', async function (this: CustomWorld, areaOfLaw, format, submissionPeriod, office, dataTable) {
    const claims: claimOptions[] = dataTable.hashes();

    let result: GenReturn;
    switch (areaOfLaw) {
        case "Legal help" :
            result = await GenerateCivilFile(1, claims.length, format as any, { submissionPeriod, office, claims });
            break;
        case "Mediation" :
            result = await GenerateMediationFiles(1, claims.length, format as any, { submissionPeriod, office, claims });
            break;
        case "Crime lower" :
            result = await GenerateCrimeFiles(1, claims.length, format as any, { submissionPeriod, office, claims });
            break;
        default : {
            throw new Error(`Invalid area of law :${areaOfLaw}`)
        }
    }

    const norm = normalizeGeneratorResult(result, office);
    const filePath = norm.filePaths[0];
    const fileName = path.basename(filePath);

    this.fileName = fileName;
    this.generatedFilePath = filePath;
    this.filePath = filePath;
    this.officeAccount = norm.office || office;

    await this.attach(`📁 Generated file for upload: ${fileName}`, 'text/plain');
    if (this.officeAccount) await this.attach(`🏢 Office: ${this.officeAccount}`, 'text/plain');
});

//
// ======================================================
//                   INVALIDATION STEP
// ======================================================
Given('I make the generated file invalid', async function (this: CustomWorld) {
    if (!this.mostRecentSubmissionId) {
        throw new Error('❌ No latest submission found. Make sure a submission was uploaded first via API.');
    }

    const dstewbaseUrl = process.env.DSTEW_API_BASE_URL;
    const dstewToken = process.env.DSTEW_API_TOKEN;

    const patchUrl = `${dstewbaseUrl}/api/v0/submissions/${this.mostRecentSubmissionId}`;

    await this.attach(`⏳ Updating submission to be invalid: ${patchUrl}`);

    const uploadResp = await this.client.patch(
        patchUrl,
        { status: "VALIDATION_FAILED" },
        {
            headers: {
                'Content-Type': 'application/json',
                accept: 'application/json',
                Authorization: dstewToken,
            },
        }
    );

    if (uploadResp.status === 204) {
        await this.attach(`✅ Submission patched via api: ${patchUrl}`, 'text/plain');
    } else {
        throw new Error(`Submission never updated (final status: ${uploadResp.status}: ${uploadResp.statusText})`);
    }
});

When('I update only the last record with a new UCN', async function (this: CustomWorld, dataTable) {
    const filePath = this.generatedFilePath!;
    const newUcn = dataTable.hashes()[0].ucn;

    if (!newUcn) {
        throw new Error('❌ No UCN provided in the table.');
    }

    let content = fs.readFileSync(filePath, 'utf-8').trimEnd();
    const lines = content.split('\n').filter(l => l.trim() !== '');

    // Find last OUTCOME line
    const lastIndex = [...lines].reverse().findIndex(line => line.startsWith('OUTCOME'));
    if (lastIndex === -1) {
        throw new Error('❌ No OUTCOME line found in generated file.');
    }

    const actualIndex = lines.length - 1 - lastIndex;
    const lastLine = lines[actualIndex];

    // Extract primary UCN
    const ucnRegex = /UCN="?([^",]+)"?/;
    const match = lastLine.match(ucnRegex);

    if (!match) {
        throw new Error(`❌ Could not find UCN in last OUTCOME line:\n${lastLine}`);
    }

    const originalUcn = match[1];

    // Replace ONLY the primary UCN
    const updatedLine = lastLine.replace(ucnRegex, `UCN=${newUcn}`);

    // Update lines array
    lines[actualIndex] = updatedLine;

    // Rewrite updated content
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');

    await this.attach(`🔧 Updated last OUTCOME UCN from ${originalUcn} → ${newUcn}`, 'text/plain');
    console.log(`✅ Updated UCN: ${originalUcn} → ${newUcn}`);
});


//
// ======================================================
//               OVERRIDE FIELD STEP
// ======================================================
Given(
    'I override the generated file field {string} with value {string}',
    async function (this: CustomWorld, field: string, value: string) {
        const filePath = this.generatedFilePath || this.filePath;

        if (!filePath) {
            throw new Error('Generated file path is not set.');
        }

        if (!fs.existsSync(filePath)) {
            throw new Error(`Generated file not found at ${filePath}`);
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const pattern = new RegExp(`(${escapeRegExp(field)}=)([^,\\r\\n]*)`, 'g');

        let replacements = 0;
        const updated = content.replace(pattern, (_match, prefix: string) => {
            replacements++;
            return `${prefix}${value}`;
        });

        if (replacements === 0) {
            throw new Error(`Field "${field}" not found in file ${filePath}`);
        }

        fs.writeFileSync(filePath, updated, 'utf8');
        this.filePath = filePath;

        await this.attach(`✏️ Overrode ${field} = ${value} in ${path.basename(filePath)}`, 'text/plain');
    }
);

//
// ======================================================
//                WEB UI UPLOAD STEP
// ======================================================
When(
    /^I (?:upload|re-upload) the (?:first|second|generated)? ?file$/,
    async function () {

        let filePath: string | undefined;

        const text = (this.stepText || "").toLowerCase();

        if (text.includes("first")) {
            filePath = this.firstFile;
        }
        else if (text.includes("second")) {
            filePath = this.secondFile;
        }
        else {
            filePath = this.generatedFilePath;
        }

        if (!filePath) {
            throw new Error("No file path found for upload.");
        }

        await this.attach(`📁 Uploading file: ${filePath}`, "text/plain");

        const bulkImportPage = new BulkImportPage(this.page!);

        await bulkImportPage.uploadFile(filePath);
        await bulkImportPage.clickUpload();

        const successBanner = this.page.locator(".govuk-notification-banner--success");
        const errorBanner = this.page.locator(".moj-alert--error");

        try {
            await Promise.race([
                successBanner.waitFor({ state: "visible", timeout: 40000 }),
                errorBanner.waitFor({ state: "visible", timeout: 40000 }),
            ]);
        } catch {
            await this.attach("⚠️ No banner appeared after upload.", "text/plain");
        }

        const submissionId =
            await this.page.locator("meta#submissionId").getAttribute("content");

        if (!submissionId) {
            await this.attach("❌ No submissionId found in <meta> tag.", "text/plain");
            throw new Error("Submission ID not found after upload");
        }

        // -----------------------------
        // Add ID to cleanup set
        // -----------------------------
        if (!this.cleanupSubmissionIds) {
            this.cleanupSubmissionIds = new Set();
        }
        this.cleanupSubmissionIds.add(submissionId);

        this.mostRecentSubmissionId = submissionId;

        await this.attach(`✅ Submission ID: ${submissionId}`, "text/plain");
    }
);


// ======================================================
//            API UPLOAD (SINGLE STEP)
// ======================================================
When('I upload with generated file via the API', async function (this: CustomWorld) {

    if (!this.generatedFilePath) {
        throw new Error('No generated file available for upload');
    }

    const fileName = path.basename(this.generatedFilePath);
    await this.attach(`⏳ Creating form with: ${fileName}`, 'text/plain');

    // 🔍 Determine correct MIME type
    const ext = path.extname(this.generatedFilePath).toLowerCase();
    const mime =
        ext === '.xml' ? 'application/xml'
            : ext === '.txt' ? 'text/plain'
                : 'text/csv';

    const form = new FormData();
    form.append('file', fs.createReadStream(this.generatedFilePath), {
        filename: fileName,
        contentType: mime,
    });

    const dstewbaseUrl = process.env.DSTEW_API_BASE_URL;
    const dstewToken = process.env.DSTEW_API_TOKEN;

    const office = pickOffice(this);
    const uploadUrl =
        `${dstewbaseUrl}/api/v0/bulk-submissions` +
        `?userId=Test.User-submit-a-bulk-claim-auto-test%40devl.justice.gov.uk&offices=${office}`;

    const uploadResp = await this.client.post(uploadUrl, form, {
        headers: {
            ...form.getHeaders(),
            accept: 'application/json',
            Authorization: dstewToken,
        },
    });

    const submissionId = uploadResp.data?.submission_ids?.[0];

    if (!submissionId) {
        throw new Error('❌ Submission ID missing from API response');
    }

    this.mostRecentSubmissionId = submissionId;
    await this.attach(`📤 Uploaded. Submission ID: ${submissionId}`, 'text/plain');

    // 🔥 NEW POLLING
    await pollSubmissionUntilTerminal(this, submissionId, office);
});


//
// ======================================================
//         API UPLOAD (WITH AOL + OUTCOMES)
// ======================================================
When(
    'I upload {string} {string} file with {string} outcomes via the API',
    async function (
        this: CustomWorld,
        areaOfLaw: string,
        format: 'txt' | 'csv' | 'xml',
        outcomes: number
    ) {
        try {
            const files = 1;
            const safeScenario = (this.currentScenarioName || 'Scenario')
                .replace(/\s+/g, '_')
                .replace(/[^a-zA-Z0-9_]/g, '');

            const uniqueSuffix = `${safeScenario}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

            let gen: GenReturn;

            switch (areaOfLaw.toLowerCase()) {
                case 'legal help':
                    gen = await GenerateCivilFile(files, outcomes as any, format, {
                        suffix: uniqueSuffix,
                    });
                    break;
                case 'mediation':
                    gen = await GenerateMediationFiles(
                        files,
                        outcomes as any,
                        format,
                        { suffix: uniqueSuffix }
                    );
                    break;
                case 'crime lower':
                    gen = await GenerateCrimeFiles(
                        files,
                        outcomes as any,
                        format,
                        { suffix: uniqueSuffix }
                    );
                    break;
                default:
                    throw new Error(`Invalid area of law: ${areaOfLaw}`);
            }

            const { filePaths, office } = normalizeGeneratorResult(gen);
            const generatedFilePath =
                filePaths.find((f) => f.includes(uniqueSuffix)) || filePaths[0];

            const fileName = path.basename(generatedFilePath);
            this.generatedFilePath = generatedFilePath;
            this.fileName = fileName;
            this.officeAccount = office || this.officeAccount;

            await this.attach(
                `📝 Generated ${areaOfLaw} file (${outcomes} outcomes): ${fileName}`,
                'text/plain'
            );

            // ⭐ MIME TYPE FIX
            const ext = path.extname(generatedFilePath).toLowerCase();
            const mime =
                ext === '.xml' ? 'application/xml' :
                    ext === '.txt' ? 'text/plain' :
                        'text/csv';

            const form = new FormData();
            form.append('file', fs.createReadStream(generatedFilePath), {
                filename: fileName,
                contentType: mime,
            });

            const dstewbaseUrl = process.env.DSTEW_API_BASE_URL;
            const dstewToken = process.env.DSTEW_API_TOKEN;

            const officeParam = pickOffice(this);
            const uploadUrl =
                `${dstewbaseUrl}/api/v0/bulk-submissions` +
                `?userId=Test.User-submit-a-bulk-claim-auto-test%40devl.justice.gov.uk&offices=${officeParam}`;

            const uploadResp = await this.client.post(uploadUrl, form, {
                headers: {
                    ...form.getHeaders(),
                    accept: 'application/json',
                    Authorization: dstewToken,
                },
            });

            const submissionId = uploadResp.data?.submission_ids?.[0];
            this.mostRecentSubmissionId = submissionId;

            await this.attach(
                `📤 Uploaded via API:\nSubmission ID: ${submissionId}`,
                'text/plain'
            );

            // 🔥 Poll until terminal state
            await pollSubmissionUntilTerminal(this, submissionId, officeParam);

        } catch (error: any) {
            await this.attach(
                `❌ Upload via API failed: ${error.message}`,
                'text/plain'
            );
            throw error;
        }
    }
);


//
// ======================================================
//               DUPLICATE LAST RECORD
// ======================================================
When('I duplicate the last record in the generated file', async function (this: CustomWorld) {
    const content = fs.readFileSync(this.generatedFilePath!, 'utf-8').trimEnd();

    const lines = content.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) {
        console.warn('⚠️ File is empty — nothing to duplicate.');
        return;
    }

    const lastLine = lines[lines.length - 1];
    fs.appendFileSync(this.generatedFilePath!, `${lastLine}`, 'utf-8');

    console.log(`✅ Duplicated last line in ${path.basename(this.generatedFilePath!)}`);
});

Given(
    'I generate two Legal help files in {string} format for office {string} that are {string} months apart with the following claims',
    async function (format, office, monthsDiff, dataTable) {

        const diff = Number(monthsDiff);
        const row = dataTable.hashes()[0];

        const claimsFile1 = [{
            ucn: row.ucn,
            ufn: row.ufn,
            feeCode: row.feeCode1
        }];

        const claimsFile2 = [{
            ucn: row.ucn,
            ufn: row.ufn,
            feeCode: row.feeCode2
        }];

        const { firstFile, secondFile, period1, period2 } =
            await GenerateTwoLegalHelpFiles(
                format as any,
                claimsFile1,
                claimsFile2,
                office,
                diff
            );

        this.firstFile = firstFile;
        this.secondFile = secondFile;

        await this.attach(`First period: ${period1}`, "text/plain");
        await this.attach(`Second period: ${period2}`, "text/plain");
    }
);



Given(
    'I generate single "Legal help" {string} file with the following claims',
    async function (this: CustomWorld, format: string, dataTable) {

        const row = dataTable.hashes()[0];

        const claims = [{
            ucn: row.ucn,
            ufn: row.ufn,
            feeCode: row.feeCode,
        }];

        const office = row.office;

        const { file, period } = await GenerateSingleLegalHelpFile(
            format as any,
            claims,
            office
        );

        this.generatedFilePath = file;
        this.firstFile = file;  // optional, for consistency
        this.period = period;

        await this.attach(`📄 Generated single Legal Help file: ${file}`, "text/plain");
        await this.attach(`📅 Submission period: ${period}`, "text/plain");
        await this.attach(`🏢 Office: ${office}`, "text/plain");
    }
);
