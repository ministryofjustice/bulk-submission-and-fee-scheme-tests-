import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import path from 'path';
import { BulkImportPage } from '../../pages/bulkImportPage';
import { BulkClaimSubmitPage } from '../../pages/BulkClaimSubmitPage';
import type { CustomWorld } from '../support/world';
import {
    generateEmptyFile,
    generateInvalidFile,
    generateLargeFile
} from '../../utils/filegenerator';
import { generateCSVFromFilename } from '../../utils/scripts/generateCSVFromFilename';
import fs from 'fs';

Given('I am on the bulk import page', async function (this: CustomWorld) {
    // @ts-ignore
    await this.page.getByRole('button', { name: 'Start now' }).click();
    this.bulkImportPage = new BulkImportPage(this.page!);
});

Given(
    /^I have generated a?n "([^"]+)" bulk submission file named "([^"]+)"$/,
    async function (this: CustomWorld, type: string, filename: string) {
        const DATA_DIR = path.resolve('tests/data/generated_csv');
        const filePath = path.join(DATA_DIR, filename);

        switch (type.toLowerCase()) {
            case 'empty':
                await generateEmptyFile(filePath);
                break;
            case 'invalid':
                await generateInvalidFile(filePath);
                break;
            case 'large':
                await generateLargeFile(filePath, 11);
                break;
            case 'restricted':
                await generateCSVFromFilename(filename);
                break;
            default:
                throw new Error(`Unsupported file type: ${type}`);
        }

        this.filePath = filePath;
        this.fileName = path.basename(filePath);
    }
);


Given(
    /^today's date\/time in Europe\/London falls in the "([^"]+)"$/,
    async function (this: CustomWorld, currentMonth: string) {
        this.currentSubmissionMonth = getFullMonthPeriod(currentMonth);
    }
);

When('I upload that file', async function (this: CustomWorld) {
    await this.bulkImportPage!.uploadFile(this.filePath!);
    await this.bulkImportPage!.clickUpload();
});

When('I click upload without attaching a file', async function (this: CustomWorld) {
    await this.bulkImportPage!.clickUpload();
});

When('I upload {string}', async function (this: CustomWorld, relativePath: string) {
    const filePath = path.resolve(relativePath);

    if (!this.bulkImportPage) {
        this.bulkImportPage = new BulkImportPage(this.page!);
    }

    await this.bulkImportPage.uploadFile(filePath);
    await this.bulkImportPage.clickUpload();

    await this.attach(`📂 Uploaded file: ${filePath}`, 'text/plain');
});


When('I stage {string} file for upload', async function (this: CustomWorld, relativePath: string) {
    this.filePath = path.resolve(relativePath);
});

When('I update the SubmissionPeriod to {string}', function (this: CustomWorld, period: string) {
    const content = fs.readFileSync(this.filePath!, 'utf-8').trimEnd();

    let resolvedPeriod: string;

    // Always set currentSubmissionMonth for assertion replacement
    this.currentSubmissionMonth = getCurrentSubmissionMonthFull();

    switch (period.toLowerCase()) {
        case "currentmonth": {
            resolvedPeriod = getCurrentSubmissionMonthShort();
            break;
        }

        case 'futuredate': {
            resolvedPeriod = getFutureSubmissionMonth(1);
            break;
        }

        default:
            throw new Error(`Unknown period type: ${period}`);
    }

    const updated = content.replace(
        /submissionPeriod=([A-Z]{3}-\d{4})/,
        `submissionPeriod=${resolvedPeriod}`
    );

    const tmpDir = path.join(process.cwd(), 'tests/generated');
    fs.mkdirSync(tmpDir, { recursive: true });

    const newFilePath = path.join(tmpDir, `generated_${Date.now()}.txt`);
    fs.writeFileSync(newFilePath, updated, 'utf-8');

    this.generatedFilePath = newFilePath;
    this.fileName = path.basename(newFilePath);
});


Then('the user sees an error message {string}', async function (this: CustomWorld, expectedMessage: string) {
    const found = await this.bulkImportPage!.checkErrorMessage(expectedMessage);
    expect(found).toBeTruthy();
});

Then('the import is complete and submission details are displayed', async function (this: CustomWorld) {
    this.bulkClaimSubmitPage = new BulkClaimSubmitPage(this.page!);

    await this.bulkClaimSubmitPage.waitForSubmissionAlert();

    const ref = await this.bulkClaimSubmitPage.getSubmissionReference();
    const filename = await this.bulkClaimSubmitPage.getSubmissionFileName();

    expect(filename).toBe(this.fileName);
    await this.bulkClaimSubmitPage.waitForProgressToComplete();
});


function getCurrentSubmissionMonthFull(): string {
    const now = new Date();
    const month = now.toLocaleString('en-GB', { month: 'long' });
    const year = now.getFullYear();
    return `${month} ${year}`;
}

function getCurrentSubmissionMonthShort(): string {
    const now = new Date();
    const month = now.toLocaleString('en-GB', { month: 'short' }).toUpperCase();
    const year = now.getFullYear();
    return `${month}-${year}`;
}

function getFutureSubmissionMonth(offsetMonths = 1): string {
    const now = new Date();
    now.setMonth(now.getMonth() + offsetMonths);
    const month = now.toLocaleString('en-GB', { month: 'short' }).toUpperCase();
    const year = now.getFullYear();
    return `${month}-${year}`;
}

function getFullMonthPeriod(offset: string): string {
    const match = offset.match(/month\+(\d+)/i);
    const plus = match ? parseInt(match[1], 10) : 0;

    const date = new Date();
    date.setMonth(date.getMonth() + plus);

    const month = date.toLocaleString('en-GB', { month: 'long' });
    const year = date.getFullYear();
    return `${month} ${year}`;
}
