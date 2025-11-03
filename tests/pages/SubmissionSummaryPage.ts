import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class SubmissionSummaryPage extends BasePage {
  readonly successBanner: Locator;
  readonly statusTag: Locator;
  readonly summaryRows: Locator;
  readonly claimsTable: Locator;
  readonly claimsTab: Locator;
  readonly matterStartsTab: Locator;
  readonly matterStartsRows: Locator;

  constructor(page: Page) {
    // 👇 The visible heading and primary button text for this page
    super(page, 'Submission summary', 'Print this page');
    this.successBanner = page.locator('.govuk-notification-banner--success');
    this.statusTag = page.locator('.govuk-tag--green');
    this.summaryRows = page.locator('.govuk-summary-list__row');
    this.claimsTable = page.locator('table.govuk-table');
    this.claimsTab = page.locator('.moj-sub-navigation__link', { hasText: 'Claims' });
    this.matterStartsTab = page.locator('.moj-sub-navigation__link', { hasText: 'Matter starts' });
    this.matterStartsRows = page.locator('#matter-starts + dl .govuk-summary-list__row');
  }

  async verifySuccessBanner() {
    await this.successBanner.waitFor({ timeout: 60000 });
    const bannerText = await this.successBanner.textContent();
    expect(bannerText).toContain('Your submission has been accepted.');
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

  private async openMatterStartsTab() {
    await this.matterStartsTab.waitFor({ state: 'visible', timeout: 10000 });
    const ariaCurrent = await this.matterStartsTab.getAttribute('aria-current');
    if (ariaCurrent === 'page') return;

    await Promise.all([
      this.page.waitForLoadState('networkidle').catch(() => {}),
      this.matterStartsTab.click(),
    ]);

    await expect(this.matterStartsTab).toHaveAttribute('aria-current', 'page', { timeout: 10000 });
  }

  async getMatterStartsData() {
    await this.openMatterStartsTab();
    await this.page.locator('#matter-starts').waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

    const rows = await this.matterStartsRows.all();
    const matterStarts: Array<{ code: string; count: number }> = [];

    for (const row of rows) {
      const code = (await row.locator('.govuk-summary-list__key').textContent())?.trim();
      const rawValue = (await row.locator('.govuk-summary-list__value').textContent())?.trim();
      if (!code || rawValue === undefined) continue;

      const parsedCount = Number(rawValue.replace(/,/g, ''));
      const count = Number.isNaN(parsedCount) ? 0 : parsedCount;
      matterStarts.push({ code, count });
    }

    return matterStarts;
  }

  async validateMatterStarts(expected: Record<string, number>) {
    const matterStarts = await this.getMatterStartsData();

    expect(matterStarts.length).toBeGreaterThanOrEqual(Object.keys(expected).length);

    for (const [code, expectedCount] of Object.entries(expected)) {
      const entry = matterStarts.find((m) => m.code === code);
      expect(entry, `Matter start code ${code} was not found`).toBeTruthy();
      expect(entry?.count).toBe(expectedCount);
    }

    return matterStarts;
  }

  async validateNoMatterStartsMessage(
    expectedMessage: string = 'There are no matter starts attached to this submission.'
  ) {
    await this.openMatterStartsTab();
    const heading = this.page.locator('#matter-starts');
    await heading.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

    await expect(this.matterStartsRows).toHaveCount(0, { timeout: 5000 });

    const messageLocator = this.page.locator('#matter-starts ~ p.govuk-body').first();
    await messageLocator.waitFor({ state: 'visible', timeout: 10000 });

    const messageText = (await messageLocator.textContent())?.trim() ?? '';
    expect(messageText).toContain(expectedMessage.trim());

    return messageText;
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
