import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class SubmissionSummaryPage extends BasePage {
  readonly successBanner: Locator;
  readonly failureBanner: Locator;
  readonly statusTag: Locator;
  readonly summaryRows: Locator;
  readonly claimsTable: Locator;

  constructor(page: Page) {
    // 👇 The visible heading and primary button text for this page

    super(page, 'Submission summary', 'Print this page');
    this.successBanner = page.locator('.govuk-notification-banner--success');
    this.failureBanner = page.locator('.moj-alert--error');
    this.statusTag = page.locator('.govuk-tag--green');
    this.summaryRows = page.locator('.govuk-summary-list__row');
    this.claimsTable = page.locator('table.govuk-table');
  }

  async verifySuccessBanner() {
    await this.successBanner.waitFor({ timeout: 60000 });
    const bannerText = await this.successBanner.textContent();
    expect(bannerText).toContain('Your submission has been accepted.');
    return bannerText;
  }

  async verifyErrorBanner(totalErrors: number) {
    await this.failureBanner.waitFor({ timeout: 60000 });
    const bannerText = await this.failureBanner.textContent();
    if(totalErrors == 1){
      expect(bannerText).toContain(`1 error was found with your submission`);
    }else{
      expect(bannerText).toContain(`${totalErrors} errors was found with your submission`);
    }
    return bannerText;
  }

  async getSummaryData() {
    const rows = await this.summaryRows.all();
    const summary: Record<string, string> = {};

    for (const row of rows) {
      const key = (await row.locator('.govuk-summary-list__key').textContent())?.trim();
      const value = (await row.locator('.govuk-summary-list__value').textContent())?.trim();
      if (key && value) summary[key] = value;
    }

    return summary;
  }

  async getClaimsData() {
    const rows = this.claimsTable.locator('tbody tr');
    const claims: any[] = [];

    const rowCount = await rows.count();
    for (let i = 0; i < rowCount; i++) {
      const cells = rows.nth(i).locator('td');
      const claim = {
        surname: await cells.nth(1).textContent(),
        forename: await cells.nth(2).textContent(),
        ufn: await cells.nth(3).textContent(),
        ucn: await cells.nth(4).textContent(),
        feeCode: await cells.nth(5).textContent(),
        value: await cells.nth(6).textContent(),
        escapeCase: await cells.nth(7).textContent(),
      };
      claims.push(
          Object.fromEntries(
              Object.entries(claim).map(([k, v]) => [k, v?.trim() || ''])
          )
      );
    }

    return claims;
  }

  async validateSummary(expectedAreaOfLaw: string) {
    const summary = await this.getSummaryData();
    expect(summary['Area of law']).toContain(expectedAreaOfLaw);
    expect(summary['Calculated bulk claim value']).toMatch(/£[\d,]+\.\d{2}/);
    expect(summary['Reference']).toMatch(/[0-9a-f\-]{36}/);
    expect(summary['Submission period']).toMatch(/[A-Z]{3}-\d{4}/);
    return summary;
  }

  async validateClaimsCount(expectedCount: number) {
    const claims = await this.getClaimsData();
    expect(claims.length).toBe(expectedCount);
    return claims;
  }

  async getSubmissionErrors(): Promise<string[]> {
    const errorRows = this.page.locator('table.govuk-table tbody tr td.govuk-table__cell');
    const count = await errorRows.count();
    const errors: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = (await errorRows.nth(i).textContent())?.trim() || '';
      if (text) errors.push(text);
    }

    return errors;
  }
}
