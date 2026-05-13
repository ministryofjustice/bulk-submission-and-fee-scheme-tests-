import { When , Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { CustomWorld } from '../support/world';
import {BulkInProgressPage} from '../../pages/BulkInProgressPage'

Then('I should see the bulk in progress page', async function (this: CustomWorld) {
    this.bulkInProgressPage = new BulkInProgressPage(this.page!);
  await this.bulkInProgressPage!.waitForPage();
  const heading = await this.bulkInProgressPage!.getHeading();
  expect(heading).toBe('Your file is being uploaded');
});

Then('the bulk upload details are displayed', async function (this: CustomWorld) {
  const dateOfUpload = await this.bulkInProgressPage!.getDateOfUpload();
  const submissionReference = await this.bulkInProgressPage!.getSubmissionReference();
  const fileName = await this.bulkInProgressPage!.getFileName();

  // Validate date looks like "19 Sept 2025 at 10:23am"
  expect(dateOfUpload).toMatch(/^\d{1,2}\s+[A-Za-z]+\s+\d{4}\s+at\s+\d{1,2}:\d{2}\s*(am|pm)$/i);

  // Validate submission reference is a UUID v4
  expect(submissionReference).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

  // Validate file name ends with .csv
  expect(fileName).toEqual(this.fileName);
});

Then('the bulk in progress actions are visible', async function (this: CustomWorld) {
  const goToSearchVisible = await this.bulkInProgressPage!.isGoToSearchVisible();
  const copyRefVisible = await this.bulkInProgressPage!.isCopyRefVisible();

  expect(goToSearchVisible).toBeTruthy();
  expect(copyRefVisible).toBeTruthy();
});

When('I click the go to search button', async function (this: CustomWorld) {
  await this.bulkInProgressPage!.clickGoToSearch();
});

When('I click the copy reference button', async function (this: CustomWorld) {
  await this.bulkInProgressPage!.clickCopyReference();
});