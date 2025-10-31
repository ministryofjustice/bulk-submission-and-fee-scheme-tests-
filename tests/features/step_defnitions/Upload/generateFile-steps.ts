import {Given, When} from '@cucumber/cucumber';
import type {CustomWorld} from '../../support/world';
import {GenerateCivilFile} from "../../../utils/scripts/generateCivilFiles";
import {GenerateMediationFiles} from "../../../utils/scripts/generateMediationFiles";
import {GenerateCrimeFiles} from "../../../utils/scripts/generateCrimeFiles";
import { generateMatterStartsFile } from "../../../utils/scripts/generateMatterStartsFile";
import path from "path";
import {BulkImportPage} from "../../../pages/bulkImportPage";
import FormData from "form-data";
import fs from "fs";
import { getUniqueSubmissionPeriod, generateScheduleRef } from "../../../utils/scripts/submissionPeriodHelper";

Given('I generate {string} {string} file with {string} outcomes', async function (this: CustomWorld, areaOfLaw, format, outcomes) {
    let files
    let generatedFiles: string[] = [];


    // 🔹 Safe scenario name fallback
    const safeScenario = (this.currentScenarioName || 'Scenario')
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '');

    const uniqueSuffix = `${safeScenario}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    console.log(`🧩 Unique suffix for file: ${uniqueSuffix}`);

    switch (areaOfLaw) {
        case "Legal help" : {
            generatedFiles = await GenerateCivilFile(files = 1, outcomes, format, uniqueSuffix)
        }
            break
        case "Mediation" : {
            generatedFiles = await GenerateMediationFiles(files = 1, outcomes, format, uniqueSuffix)
        }
            break
        case "Crime lower" : {
            generatedFiles = await GenerateCrimeFiles(files = 1, outcomes, format, uniqueSuffix)
        }
            break
        default : {
            throw new Error(`Invalid area of law :${areaOfLaw}`)
        }
    }

    const filePath = generatedFiles.find(f => f.includes(uniqueSuffix)) || generatedFiles[0];
    const fileName = path.basename(filePath);
    this.fileName = fileName;
    this.generatedFilePath = filePath;
    await this.attach(`📁 Generated file for upload: ${fileName}`, 'text/plain');
});

When(
    'I generate {string} {string} with all matter type file',
    async function (this: CustomWorld, areaOfLaw: string, format: string) {
        const result = await generateMatterStartsFile(areaOfLaw, format, '', 1, { includeAllCodes: true });

        this.fileName = result.fileName;
        this.generatedFilePath = result.filePath;
        this.matterStartCounts = result.counts;
        this.submissionPeriod = result.submissionPeriod;
        this.officeAccount = result.officeAccount;

        await this.attach(
            `📝 Generated matter starts file (all codes): ${result.fileName}`,
            'text/plain'
        );
        await this.attach(
            `🗓 Submission period: ${result.submissionPeriod}\n📄 Schedule ref: ${result.scheduleRef}`,
            'text/plain'
        );
    }
);


When('I upload the generated file', async function (this: CustomWorld) {
    if (!this.generatedFilePath) {
        throw new Error('❌ No file found to upload. Make sure a file was generated first.');
    }

    const bulkImportPage = new BulkImportPage(this.page!);

    await this.attach(`📤 Uploading file: ${this.fileName}`, 'text/plain');

    // ✅ Upload the generated file
    await bulkImportPage.uploadFile(this.generatedFilePath);

    // ✅ Click Upload (Continue)
    await bulkImportPage.clickUpload();

    // ✅ Optional: wait for navigation or confirmation
    await this.page!.waitForLoadState('networkidle');


    const successBanner = this.page!.locator('.govuk-notification-banner--success');

    try {
        await successBanner.waitFor({
            state: 'visible',
            timeout: 30000, // up to 60 s to allow for server validation & redirect
        });

        const bannerText = await successBanner.textContent();
        await this.attach(`✅ Upload succeeded. Message: ${bannerText}`, 'text/plain');
    } catch {
        await this.attach('❌ Submission success banner did not appear within 60 seconds.', 'text/plain');
        // throw new Error('Submission success banner not found — upload may have failed.');
    }
});


When(
    'I upload {string} {string} file with {string} outcomes via the API',
    async function (this: CustomWorld, areaOfLaw: string, format: "txt" | "csv" | "xml", outcomes: number) {
        try {
            let generatedFiles: string[] = [];

            // 🔹 Safe scenario name fallback
            const safeScenario = (this.currentScenarioName || 'Scenario')
                .replace(/\s+/g, '_')
                .replace(/[^a-zA-Z0-9_]/g, '');

            const uniqueSuffix = `${safeScenario}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

            // 🧩 Step 1: Generate the file dynamically
            switch (areaOfLaw.toLowerCase()) {
                case 'legal help':
                    generatedFiles = await GenerateCivilFile(1, outcomes, format, uniqueSuffix);
                    break;
                case 'mediation':
                    generatedFiles = await GenerateMediationFiles(1, outcomes, format, uniqueSuffix);
                    break;
                case 'crime lower':
                    generatedFiles = await GenerateCrimeFiles(1, outcomes, format, uniqueSuffix);
                    break;
                default:
                    throw new Error(`Invalid area of law: ${areaOfLaw}`);
            }


            const generatedFilePath = generatedFiles.find(f => f.includes(uniqueSuffix)) || generatedFiles[0];
            const fileName = path.basename(generatedFilePath);
            this.generatedFilePath = generatedFilePath;
            await this.attach(`📝 Generated ${areaOfLaw} file (${outcomes} outcomes): ${fileName}`, 'text/plain');

            // 🚀 Step 2: Upload file via API
            const form = new FormData();
            form.append('file', fs.createReadStream(generatedFilePath), {
                filename: fileName,
                contentType: 'text/csv',
            });

            const dstewbaseUrl = process.env.DSTEW_API_BASE_URL;
            const dstewToken = process.env.DSTEW_API_TOKEN;

            const uploadUrl =
                `${dstewbaseUrl}/api/v0/bulk-submissions` +
                '?userId=Test.User-submit-a-bulk-claim-auto-test%40devl.justice.gov.uk&offices=0P322F';

            const uploadResp = await this.client.post(uploadUrl, form, {
                headers: {
                    ...form.getHeaders(),
                    accept: 'application/json',
                    Authorization: dstewToken,
                },
            });

            const {bulk_submission_id, submission_ids} = uploadResp.data;
            const submissionId = submission_ids?.[0];
            this.mostRecentSubmissionId = submissionId;

            await this.attach(
                `📤 Uploaded via API:\nBulk Submission: ${bulk_submission_id}\nSubmission ID: ${submissionId}`,
                'text/plain'
            );

            // ⏳ Step 3: Poll until VALIDATION_SUCCEEDED
            const maxRetries = 25;
            const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
            let status = '';
            let submissionPeriod = '';

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                const resp = await this.client.get(
                    `${dstewbaseUrl}/api/v0/submissions?offices=0P322F&submission_id=${submissionId}&page=0&size=20`,
                    {
                        headers: {
                            accept: 'application/json',
                            Authorization: dstewToken,
                        },
                    }
                );

                const submission = resp.data.content?.[0];
                status = submission?.status || 'UNKNOWN';
                submissionPeriod = submission?.submission_period || '';
                await this.attach(`Attempt ${attempt}: current status = ${status} (${submissionPeriod})`, 'text/plain');
                if (status === 'VALIDATION_SUCCEEDED') {
                    await this.attach(`✅ Submission validated successfully: ${submissionId}`, 'text/plain');
                    break;
                }

                await delay(3000);
            }

            if (status !== 'VALIDATION_SUCCEEDED') {
                throw new Error(`Submission never reached VALIDATION_SUCCEEDED (final status: ${status})`);
            }

            this.submissionPeriod = submissionPeriod;
            await this.attach(`📦 Stored submission period for reuse: ${submissionPeriod}`, 'text/plain');

        } catch (error: any) {
            await this.attach(`❌ Upload via API failed: ${error.message}`, 'text/plain');
            throw error;
        }
    }
);

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
