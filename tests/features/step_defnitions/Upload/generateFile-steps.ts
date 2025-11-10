import {Given, When} from '@cucumber/cucumber';
import type {CustomWorld} from '../../support/world';
import {GenerateCivilFile} from '../../../utils/scripts/generateCivilFiles';
import {GenerateMediationFiles} from '../../../utils/scripts/generateMediationFiles';
import {GenerateCrimeFiles} from '../../../utils/scripts/generateCrimeFiles';
import {generateMatterStartsFile} from '../../../utils/scripts/generateMatterStartsFile';
import {claimOptions} from '../../../utils/scripts/claimOptions';
import path from 'path';
import {BulkImportPage} from '../../../pages/bulkImportPage';
import FormData from 'form-data';
import fs from 'fs';
import {getSubmissionPeriod} from "../../../utils/scripts/submissionPeriodHelper";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

Given(
    'I generate {string} {string} file with {string} outcomes',
    async function (this: CustomWorld, areaOfLaw, format, outcomes) {
      const files = 1;
      const totalOutcomes = Number(outcomes);
      let generatedFiles: string[] = [];

      const safeScenario = (this.currentScenarioName || 'Scenario')
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '');
      const uniqueSuffix = `${safeScenario}_${Date.now()}_${Math.floor(
          Math.random() * 10000
      )}`;

      console.log(`🧩 Unique suffix for file: ${uniqueSuffix}`);

      switch (areaOfLaw) {
        case 'Legal help':
          generatedFiles = await GenerateCivilFile(files, totalOutcomes, format, {
            suffix: uniqueSuffix,
          });
          break;
        case 'Mediation':
          generatedFiles = await GenerateMediationFiles(
              files,
              totalOutcomes,
              format, {
                suffix: uniqueSuffix,
              }
          );
          break;
        case 'Crime lower':
          generatedFiles = await GenerateCrimeFiles(
              files,
              totalOutcomes,
              format, {
                suffix: uniqueSuffix,
              }
          );
          break;
        default:
          throw new Error(`Invalid area of law :${areaOfLaw}`);
      }

      const filePath =
          generatedFiles.find((f) => f.includes(uniqueSuffix)) || generatedFiles[0];
      const fileName = path.basename(filePath);
      this.fileName = fileName;
      this.generatedFilePath = filePath;
      await this.attach(`📁 Generated file for upload: ${fileName}`, 'text/plain');
    }
);

When(
    'I generate {string} {string} with all matter type file',
    async function (this: CustomWorld, areaOfLaw: string, format: string) {
      const result = await generateMatterStartsFile(areaOfLaw, format, '', 1, {includeAllCodes: true});

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


Given('I generate {string} {string} file with the following claims', async function (this: CustomWorld, areaOfLaw, format, dataTable) {

  let claims: claimOptions[] = dataTable.hashes();

  let generatedFiles: string[] = [];
  switch (areaOfLaw) {
    case "Legal help" :
      generatedFiles = await GenerateCivilFile(1, claims.length, format, {claims})
      break
    case "Mediation" :
      generatedFiles = await GenerateMediationFiles(1, claims.length, format, {claims})
      break
    case "Crime lower" :
      generatedFiles = await GenerateCrimeFiles(1, claims.length, format, {claims})
      break
    default : {
      throw new Error(`Invalid area of law :${areaOfLaw}`)
    }
  }

  const filePath = generatedFiles[0];
  const fileName = path.basename(filePath);
  this.fileName = fileName;
  this.generatedFilePath = filePath;
  this.filePath = filePath;
  await this.attach(`📁 Generated file for upload: ${fileName}`, 'text/plain');
});

Given('I generate {string} {string} file with the following claims from period {string}', async function (this: CustomWorld, areaOfLaw, format, submissionPeriod, dataTable) {

  let claims: claimOptions[] = dataTable.hashes();

  for (let i = 0; i < claims.length; i++) {
    console.log(`➕Claim to add ${i}: ${claims[i].ucn}, ${claims[i].ufn}, ${claims[i].feeCode}`);
  }

  if (this.currentSubmissionMonth && submissionPeriod) {
      submissionPeriod = getSubmissionPeriod(submissionPeriod);
  }

  let generatedFiles: string[] = [];
  switch (areaOfLaw) {
    case "Legal help" :
      generatedFiles = await GenerateCivilFile(1, claims.length, format, {submissionPeriod, claims})
      break
    case "Mediation" :
      generatedFiles = await GenerateMediationFiles(1, claims.length, format)
      break
    case "Crime lower" :
      generatedFiles = await GenerateCrimeFiles(1, claims.length, format)
      break
    default : {
      throw new Error(`Invalid area of law :${areaOfLaw}`)
    }
  }

  const filePath = generatedFiles[0];
  const fileName = path.basename(filePath);
  this.fileName = fileName;
  this.generatedFilePath = filePath;
  await this.attach(`📁 Generated file for upload: ${fileName}`, 'text/plain');
});

Given('I generate {string} {string} file with the following claims from period {string} with office {string}', async function (this: CustomWorld, areaOfLaw, format, submissionPeriod, office, dataTable) {

  let claims: claimOptions[] = dataTable.hashes();

  for (let i = 0; i < claims.length; i++) {
    console.log(`➕Claim to add ${i}: ${claims[i].ucn}, ${claims[i].ufn}, ${claims[i].feeCode}`);
  }

  let generatedFiles: string[] = [];
  switch (areaOfLaw) {
    case "Legal help" :
      generatedFiles = await GenerateCivilFile(1, claims.length, format, {
        submissionPeriod,
        office,
        claims,
      })
      break
    case "Mediation" :
      generatedFiles = await GenerateMediationFiles(1, claims.length, format)
      break
    case "Crime lower" :
      generatedFiles = await GenerateCrimeFiles(1, claims.length, format)
      break
    default : {
      throw new Error(`Invalid area of law :${areaOfLaw}`)
    }
  }

  const filePath = generatedFiles[0];
  const fileName = path.basename(filePath);
  this.fileName = fileName;
  this.generatedFilePath = filePath;
  this.filePath = filePath;
  await this.attach(`📁 Generated file for upload: ${fileName}`, 'text/plain');
});

Given('I make the generated file invalid', async function (this: CustomWorld) {
  if (!this.mostRecentSubmissionId) {
    throw new Error('❌ No latest submission found. Make sure a submission was uploaded first via API.');
  }

  const dstewbaseUrl = process.env.DSTEW_API_BASE_URL;
  const dstewToken = process.env.DSTEW_API_TOKEN;

  const patchUrl =
      `${dstewbaseUrl}/api/v0/submissions/${this.mostRecentSubmissionId}`;

  await this.attach(`⏳ Updating submission to be invalid: ${dstewbaseUrl}/api/v0/submissions/${this.mostRecentSubmissionId}`);

  const uploadResp = await this.client.patch(patchUrl, {
        status: "VALIDATION_FAILED"
      },
      {
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
          Authorization: dstewToken,
        },
      });

  if (uploadResp.status === 204) {
    await this.attach(`✅ Submission patched via api: ${dstewbaseUrl}/api/v0/submissions/${this.mostRecentSubmissionId}`, 'text/plain');
  } else {
    throw new Error(`Submission never updated (final status: ${uploadResp.status}: ${uploadResp.statusText})`);
  }
})

Given(
  'I override the generated file field {string} with value {string}',
  async function (this: CustomWorld, field: string, value: string) {
    const filePath = this.generatedFilePath || this.filePath;
    if (!filePath) {
      throw new Error('Generated file path is not set. Did you run the generator step first?');
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`Generated file not found at ${filePath}`);
    }

    const trimmedField = field.trim();
    const trimmedValue = value.trim();

    const content = fs.readFileSync(filePath, 'utf8');
    const pattern = new RegExp(`(${escapeRegExp(trimmedField)}=)([^,\\r\\n]*)`, 'g');

    let replacements = 0;
    const updated = content.replace(pattern, (_match, prefix: string) => {
      replacements++;
      return `${prefix}${trimmedValue}`;
    });

    if (replacements === 0) {
      throw new Error(`Field "${trimmedField}" not found in generated file ${filePath}`);
    }

    fs.writeFileSync(filePath, updated, 'utf8');
    this.filePath = filePath;

    await this.attach(
      `✏️ Overrode field ${trimmedField} with value ${trimmedValue} in ${path.basename(filePath)}`,
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
    'I upload with generated file via the API',
    async function (this: CustomWorld) {

      if (!this.generatedFilePath) {
        throw new Error('No generated file available for upload');
      }
      try {
        // 🚀 Step 1: Upload file via API
        await this.attach(`⏳ Creating form with: ${this.generatedFilePath}/${this.fileName}`);

        const form = new FormData();
        form.append('file', fs.createReadStream(this.generatedFilePath), {
          filename: this.fileName,
          contentType: 'text/csv',
        });

        const dstewbaseUrl = process.env.DSTEW_API_BASE_URL;
        const dstewToken = process.env.DSTEW_API_TOKEN;

        const uploadUrl =
            `${dstewbaseUrl}/api/v0/bulk-submissions` +
            '?userId=Test.User-submit-a-bulk-claim-auto-test%40devl.justice.gov.uk&offices=0P322F';


        await this.attach(`⏳ Uploading to api: ${dstewbaseUrl}/api/v0/bulk-submissions`);
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

        // ⏳ Step 2: Poll until VALIDATION_SUCCEEDED
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

        const uniqueSuffix = `${safeScenario}_${Date.now()}_${Math.floor(
            Math.random() * 10000
        )}`;

        let generatedFiles: string[] = [];

        switch (areaOfLaw.toLowerCase()) {
          case 'legal help':
            generatedFiles = await GenerateCivilFile(files, outcomes, format, {
              suffix: uniqueSuffix,
            });
            break;
          case 'mediation':
            generatedFiles = await GenerateMediationFiles(
                files,
                outcomes,
                format, {
                  suffix: uniqueSuffix,
                }
            );
            break;
          case 'crime lower':
            generatedFiles = await GenerateCrimeFiles(
                files,
                outcomes,
                format, {
                  suffix: uniqueSuffix,
                }
            );
            break;
          default:
            throw new Error(`Invalid area of law: ${areaOfLaw}`);
        }

        const generatedFilePath =
            generatedFiles.find((f) => f.includes(uniqueSuffix)) ||
            generatedFiles[0];
        const fileName = path.basename(generatedFilePath);
        this.generatedFilePath = generatedFilePath;
        await this.attach(
            `📝 Generated ${areaOfLaw} file (${outcomes} outcomes): ${fileName}`,
            'text/plain'
        );

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

        const maxRetries = 25;
        const delay = (ms: number) =>
            new Promise((res) => setTimeout(res, ms));
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
          await this.attach(
              `Attempt ${attempt}: current status = ${status} (${submissionPeriod})`,
              'text/plain'
          );
          if (status === 'VALIDATION_SUCCEEDED') {
            await this.attach(
                `✅ Submission validated successfully: ${submissionId}`,
                'text/plain'
            );
            break;
          }

          await delay(3000);
        }

        if (status !== 'VALIDATION_SUCCEEDED') {
          throw new Error(
              `Submission never reached VALIDATION_SUCCEEDED (final status: ${status})`
          );
        }

        this.submissionPeriod = submissionPeriod;
        await this.attach(
            `📦 Stored submission period for reuse: ${submissionPeriod}`,
            'text/plain'
        );
      } catch (error: any) {
        await this.attach(
            `❌ Upload via API failed: ${error.message}`,
            'text/plain'
        );
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
