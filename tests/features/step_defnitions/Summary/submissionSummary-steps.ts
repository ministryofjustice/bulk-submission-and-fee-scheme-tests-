import { Then } from '@cucumber/cucumber';
import type { CustomWorld } from '../../support/world';
import { SubmissionSummaryPage } from '../../../pages/SubmissionSummaryPage';
import {expect} from "@playwright/test";

Then(
    'I should see the submission summary for {string} with {string} claims',
    async function (this: CustomWorld, areaOfLaw: string, claimCount: string) {
        const summaryPage = new SubmissionSummaryPage(this.page!);

        await summaryPage.verifySuccessBanner();

        const summary = await summaryPage.validateSummary(areaOfLaw);
        const claims = await summaryPage.validateClaimsCount(Number(claimCount));

        await this.attach(`✅ Summary validated:\n${JSON.stringify(summary, null, 2)}`, 'text/plain');
        await this.attach(`✅ Claims validated (${claims.length} found)`, 'text/plain');
    }
);

Then(
    'I should have {int} submission error for {string}',
    async function (this: CustomWorld, expectedErrorCount: number, areaOfLaw:string, dataTable) {
            this.submissionSummaryPage = new SubmissionSummaryPage(this.page!);

            const errors = await this.submissionSummaryPage.getSubmissionErrors();
            await this.attach(`📋 Found ${errors.length} submission error(s).`, 'text/plain');
            expect(errors.length).toBe(expectedErrorCount);

            // 🧠 Extract the stored period and area of law for precise validation
            const submissionPeriod = this.submissionPeriod;

            // 🧩 Expected composite message structure
            const expectedMessage = `Submission already exists for Office (0P322F), Area of Law (${areaOfLaw}),  Period (${submissionPeriod})`;
            console.log(expectedMessage)

            await this.attach(`🔎 Expecting to find message:\n${expectedMessage}`, 'text/plain');

            const match = errors.some((err) => err.includes(expectedMessage));
            expect(
                match,
                `Expected submission error message to include:\n"${expectedMessage}"\n\nFound:\n${errors.join('\n')}`
            ).toBeTruthy();

            await this.attach(`✅ Verified submission error for ${areaOfLaw}, period ${submissionPeriod}`, 'text/plain');
    }
);


Then(
    'I should see a submission error message for {string} saying',
    async function (this: CustomWorld, areaOfLaw: string, docString: string) {
        const expectedMessage = docString.trim();
        const errorLocator = this.page!.locator('.moj-alert__heading, .govuk-table__cell');

        await errorLocator.first().waitFor({ state: 'visible', timeout: 12000 });
        const text = await errorLocator.allTextContents();

        const match = text.some(t => t.includes(expectedMessage));

        await this.attach(`🔍 Found error text:\n${text.join('\n')}`, 'text/plain');
        expect(match, `Expected error message not found for ${areaOfLaw}`).toBeTruthy();
    }
);


Then(
    'I should see the following submission error messages for {string}:',
    async function (this: CustomWorld, areaOfLaw: string, dataTable) {
        // Collect all visible text from likely error areas
        const errorLocator = this.page!.locator(
            '.moj-alert__heading, .govuk-table__cell, .govuk-error-summary, .moj-banner--failure, [role="alert"]'
        );

        // Wait until at least one error element is visible
        await errorLocator.first().waitFor({ state: 'visible', timeout: 15000 });

        const allText = await errorLocator.allTextContents();
        await this.attach(`🧾 Found error text:\n${allText.join('\n')}`, 'text/plain');

        const expectedMessages = dataTable.raw().flat().slice(1); // skip header row

        for (const message of expectedMessages) {
            const found = allText.some(t => t.includes(message.trim()));
            expect(
                found,
                `❌ Expected error message not found for ${areaOfLaw}: "${message.trim()}"`
            ).toBeTruthy();
        }
    }
);


Then('I should see an error banner saying {string}', async function (this: CustomWorld, expectedMessage: string) {
    // Typical GOV.UK and MOJ banner selectors
    const bannerLocator = this.page!.locator(
        '.govuk-error-summary, .moj-banner--failure, .moj-alert__heading, [role="alert"]'
    );

    // Wait until the banner is visible
    await bannerLocator.first().waitFor({ state: 'visible', timeout: 50000 });

    const text = await bannerLocator.allTextContents();
    const found = text.some(t => t.includes(expectedMessage));

    await this.attach(`🔍 Found banner text:\n${text.join('\n')}`, 'text/plain');
    expect(found, `❌ Expected banner message not found: "${expectedMessage}"`).toBeTruthy();
});



Then(
    'I should now see the following detailed submission error messages for {string}:',
    async function (this: CustomWorld, areaOfLaw: string, docString: string) {
        const expectedMessages = docString
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean);

        const paginationNext = this.page!.locator('a:has-text("Next")');
        const paginationPrev = this.page!.locator('a:has-text("Previous")');
        const errorLocator = this.page!.locator(
            '.govuk-table__cell, .moj-alert__heading, .govuk-error-summary, .moj-banner--failure, [role="alert"]'
        );

        const collectedText: string[] = [];

        // Helper to capture messages on the current page
        const capturePageErrors = async () => {
            await errorLocator.first().waitFor({ state: 'visible', timeout: 15000 });
            const text = await errorLocator.allTextContents();
            collectedText.push(...text.map(t => t.trim()).filter(Boolean));
        };

        // Capture first page
        await capturePageErrors();

        // Handle pagination
        while (await paginationNext.isVisible()) {
            await paginationNext.click();
            await this.page!.waitForLoadState('networkidle');
            await capturePageErrors();
        }

        // Go back to first page (optional)
        if (await paginationPrev.isVisible()) {
            await paginationPrev.click();
            await this.page!.waitForLoadState('networkidle');
        }

        await this.attach(
            `🧾 Collected UI error messages across all pages:\n${collectedText.join('\n')}`,
            'text/plain'
        );

        // Validate each expected error message
        for (const message of expectedMessages) {
            const found = collectedText.some(t => t.includes(message));
            expect(found, `❌ Expected error message not found for ${areaOfLaw}: "${message}"`).toBeTruthy();
        }
    }
);
