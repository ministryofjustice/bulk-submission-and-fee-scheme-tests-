import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import path from 'path';
import { BulkImportPage } from '../../pages/bulkImportPage';
import { BulkClaimSubmitPage } from '../../pages/BulkClaimSubmitPage';
import type { CustomWorld } from '../support/world';
import { generateEmptyFile, generateInvalidFile, generateLargeFile } from '../../utils/filegenerator';
import { generateCSVFromFilename } from '../../utils/scripts/generateCSVFromFilename';

const DATA_DIR = path.resolve('tests/data/generated_csv');

Given('I am on the bulk import page', async function (this: CustomWorld) {
    await this.page!.goto('/upload');
    this.bulkImportPage = new BulkImportPage(this.page!);
});

// Given('I have generated a(n) {string} bulk submission file named {string}', async function (this: CustomWorld, type: string, filename: string) {
//     const filePath = path.join(DATA_DIR, filename);
//
//     switch (type.toLowerCase()) {
//         case 'empty':
//             await generateEmptyFile(filePath);
//             break;
//         case 'invalid':
//             await generateInvalidFile(filePath);
//             break;
//         case 'large':
//             await generateLargeFile(filePath, 20);
//             break;
//         case 'restricted':
//             await generateCSVFromFilename(filename);
//             break;
//         default:
//             throw new Error(`Unsupported file type: ${type}`);
//     }
//
//     this.filePath = filePath;
//     this.fileName = path.basename(filePath);
// });


Given(/^I have generated a?n "([^"]+)" bulk submission file named "([^"]+)"$/, async function (this: CustomWorld, type: string, filename: string) {
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
});

When('I upload that file', async function (this: CustomWorld) {
    await this.bulkImportPage!.uploadFile(this.filePath!);
    await this.bulkImportPage!.clickUpload();
});

When('I click upload without attaching a file', async function (this: CustomWorld) {
    await this.bulkImportPage!.clickUpload();
});

Then('the user sees an error message {string}', async function (this: CustomWorld, expectedMessage: string) {
    const found = await this.bulkImportPage!.checkErrorMessage(expectedMessage);
    expect(found).toBeTruthy();
});

Then('the import is complete and submission details are displayed', async function (this: CustomWorld) {
    this.bulkClaimSubmitPage = new BulkClaimSubmitPage(this.page!);

    await this.bulkClaimSubmitPage!.waitForSubmissionAlert();

    const ref = await this.bulkClaimSubmitPage!.getSubmissionReference();
    const filename = await this.bulkClaimSubmitPage!.getSubmissionFileName();

    expect(filename).toBe(this.fileName);
    await this.bulkClaimSubmitPage!.waitForProgressToComplete();
});


When('I upload {string}', async function (this: CustomWorld, relativePath: string) {
    // Resolve full file path
    const filePath = path.resolve(relativePath);

    // Ensure we’re on the upload page
    if (!this.bulkImportPage) {
        this.bulkImportPage = new BulkImportPage(this.page!);
    }

    // Upload and trigger submission
    await this.bulkImportPage.uploadFile(filePath);
    await this.bulkImportPage.clickUpload();

    // Attach for debugging
    await this.attach(`📂 Uploaded file: ${filePath}`, 'text/plain');
});
