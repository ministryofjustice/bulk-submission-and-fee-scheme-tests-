import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { goToPaginationPage } from '../utils/scripts/pageNavigation';

export class SubmissionSummaryPage extends BasePage {
  readonly successBanner: Locator;
  readonly failureBanner: Locator;
  readonly warningBanner: Locator;
  readonly exportButton: Locator;
  readonly statusTag: Locator;
  readonly summaryRows: Locator;
  readonly claimsTable: Locator;
  readonly claimsTab: Locator;
  readonly messagesTab: Locator;
  readonly matterStartsTab: Locator;
  readonly matterStartsRows: Locator;

  constructor(page: Page) {
    super(page, 'Submission summary', 'Print this page');

    this.successBanner = page.locator('.govuk-notification-banner--success');
    this.failureBanner = page.locator('.moj-alert--error');
    this.warningBanner = page.locator('.moj-alert--warning');
    this.exportButton = page.locator('.govuk-button', { hasText: 'Download Claims' });
    this.statusTag = page.locator('.govuk-tag--green');
    this.summaryRows = page.locator('.govuk-summary-list__row');
    this.claimsTable = page.locator('table.govuk-table');
    this.claimsTab = page.locator('.moj-sub-navigation__link', { hasText: 'Claims' });
    this.messagesTab = page.locator('.moj-sub-navigation__link', { hasText: 'Messages' });
    this.matterStartsTab = page.locator('.moj-sub-navigation__link', { hasText: 'Matter starts' });
    this.matterStartsRows = page.locator('#matter-starts + dl .govuk-summary-list__row');
  }

  async waitForPage() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.heading.waitFor({ state: 'visible', timeout: 120_000 });
    await this.claimsTable.waitFor({ state: 'visible', timeout: 10_000 });
  }

  async getSubmissionReference(): Promise<string> {
    return this.page.locator('dt:has-text("Submission reference") + dd').innerText();
  }

  async verifySuccessBanner() {
    await this.successBanner.waitFor({ timeout: 60_000 });
    const bannerText = await this.successBanner.textContent();
    expect(bannerText).toContain('Your submission has been accepted.');
    return bannerText;
  }

  async verifyErrorBanner(totalErrors: number) {
    await this.failureBanner.waitFor({ timeout: 60_000 });
    const bannerText = await this.failureBanner.textContent();

    if (totalErrors === 1) {
      expect(bannerText).toContain('1 error was found with your submission');
    } else {
      expect(bannerText).toContain(`${totalErrors} errors was found with your submission`);
    }

    return bannerText;
  }

  async verifyWarningBanner(totalWarnings: number) {
    await this.warningBanner.waitFor({ timeout: 60_000 });
    const bannerText = await this.warningBanner.textContent();

    if (totalWarnings === 1) {
      expect(bannerText).toContain('1 claim has a warning message');
    } else {
      expect(bannerText).toContain(`${totalWarnings} claims have warning messages`);
    }

    return bannerText;
  }

  async getSummaryData() {
    const rows = await this.summaryRows.all();
    const summary: Record<string, string> = {};

    for (const row of rows) {
      const key = (await row.locator('.govuk-summary-list__key').textContent())?.trim();
      const value = (await row.locator('.govuk-summary-list__value').textContent())?.trim();

      if (key && value) {
        summary[key] = value;
      }
    }

    return summary;
  }

  async getAreaOfLaw(): Promise<string> {
    const summary = await this.getSummaryData();
    return summary['Area of law']?.trim() ?? '';
  }

  async getClaimsData(areaOfLaw: string = 'Legal help') {
    const rows = this.claimsTable.locator('tbody tr');
    const claims: Record<string, string>[] = [];

    const rowCount = await rows.count();

    for (let i = 0; i < rowCount; i++) {
      const cells = rows.nth(i).locator('td');

      let claim: Record<string, string | null> = {
        surname: await cells.nth(1).textContent(),
        forename: null,
        ucn: null,
        surnameTwo: null,
        forenameTwo: null,
        ucnTwo: null,
        initial: null,
        ufn: null,
        feeCode: null,
        value: await cells.nth(6).textContent(),
        escapeCase: await cells.nth(7).textContent(),
        dateWorkConcluded: null,
        messages: null,
      };

      if (areaOfLaw === 'Legal help') {
        claim = {
          ...claim,
          forename: await cells.nth(2).textContent(),
          ufn: await cells.nth(3).textContent(),
          ucn: await cells.nth(4).textContent(),
          feeCode: await cells.nth(5).textContent(),
          messages: await cells.nth(8).textContent(),
        };
      } else if (areaOfLaw === 'Crime lower') {
        claim = {
          ...claim,
          initial: await cells.nth(2).textContent(),
          ufn: await cells.nth(3).textContent(),
          feeCode: await cells.nth(4).textContent(),
          dateWorkConcluded: await cells.nth(5).textContent(),
          messages: await cells.nth(8).textContent(),
        };
      } else if (areaOfLaw === 'Mediation') {
        claim = {
          ...claim,
          forename: await cells.nth(2).textContent(),
          ucn: await cells.nth(3).textContent(),
          surnameTwo: await cells.nth(4).textContent(),
          forenameTwo: await cells.nth(5).textContent(),
          ucnTwo: await cells.nth(6).textContent(),
          feeCode: await cells.nth(7).textContent(),
        };
      }

      claims.push(
          Object.fromEntries(
              Object.entries(claim).map(([k, v]) => [k, v?.trim() || ''])
          )
      );
    }

    return claims;
  }

  private async openMatterStartsTab() {
    await this.matterStartsTab.waitFor({ state: 'visible', timeout: 10_000 });

    const ariaCurrent = await this.matterStartsTab.getAttribute('aria-current');
    if (ariaCurrent === 'page') return;

    await Promise.all([
      this.page.waitForLoadState('networkidle').catch(() => {}),
      this.matterStartsTab.click(),
    ]);

    await expect(this.matterStartsTab).toHaveAttribute('aria-current', 'page', {
      timeout: 10_000,
    });
  }

  async getMatterStartsData() {
    await this.openMatterStartsTab();
    await this.page.locator('#matter-starts').waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});

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
    await heading.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});

    await expect(this.matterStartsRows).toHaveCount(0, { timeout: 5_000 });

    const messageLocator = this.page.locator('#matter-starts ~ p.govuk-body').first();
    await messageLocator.waitFor({ state: 'visible', timeout: 10_000 });

    const messageText = (await messageLocator.textContent())?.trim() ?? '';
    expect(messageText).toContain(expectedMessage.trim());

    return messageText;
  }

  async ensureMatterStartsTabHidden() {
    await expect(this.matterStartsTab).toHaveCount(0, { timeout: 5_000 });
  }

  async validateSummary(expectedAreaOfLaw: string) {
    const summary = await this.getSummaryData();

    expect(summary['Area of law']).toContain(expectedAreaOfLaw);
    expect(summary['Calculated bulk claim value']).toMatch(/£[\d,]+\.\d{2}/);
    expect(summary['Submission reference']).toMatch(/[0-9a-f\-]{36}/);
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

  async openClaimByIndex(index = 0): Promise<void> {
    const rows = this.claimsTable.locator('tbody tr');
    await rows.first().waitFor({ state: 'visible', timeout: 10000 });

    const totalRows = await rows.count();
    if (totalRows === 0) {
      throw new Error('No claim rows were found on the submission summary page.');
    }

    const targetIndex = Math.min(Math.max(index, 0), totalRows - 1);
    const targetRow = rows.nth(targetIndex);

    const targetLink = targetRow.locator('td').first().locator('a.govuk-link', { hasText: 'View' });
    await targetLink.waitFor({ state: 'visible', timeout: 10000 });
    await targetLink.scrollIntoViewIfNeeded();

    await Promise.all([
      this.page.waitForLoadState('domcontentloaded').catch(() => {}),
      targetLink.click(),
    ]);
  }

  async getClaimIdByIndex(index = 0): Promise<string> {
    const viewLinks = this.page.locator(
        'table[data-moj-sortable-table-init] tbody tr td:first-child a.govuk-link',
        { hasText: 'View' }
    );

    await viewLinks.first().waitFor({ state: 'visible', timeout: 10_000 });

    const totalLinks = await viewLinks.count();
    if (totalLinks === 0) {
      throw new Error('No claim rows with a View link were found on the submission details page.');
    }

    const targetIndex = Math.min(Math.max(index, 0), totalLinks - 1);
    const href = await viewLinks.nth(targetIndex).getAttribute('href');

    if (!href) {
      throw new Error(`Could not read href for claim row index ${targetIndex}.`);
    }

    const uuidMatches = href.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi);
    if (!uuidMatches || uuidMatches.length === 0) {
      throw new Error(`Could not extract claim UUID from href: ${href}`);
    }

    return uuidMatches[uuidMatches.length - 1];
  }

  async expectVoidedTagForClaim(index = 0): Promise<void> {
    const rows = this.claimsTable.locator('tbody tr');
    await rows.first().waitFor({ state: 'visible', timeout: 10000 });

    const totalRows = await rows.count();
    if (totalRows === 0) {
      throw new Error('No claim rows were found on the submission summary page.');
    }

    const targetIndex = Math.min(Math.max(index, 0), totalRows - 1);
    const row = rows.nth(targetIndex);

    const badge = row.locator('td:first-child .moj-badge.moj-badge--red', { hasText: 'VOIDED' });

    await expect(badge).toBeVisible({ timeout: 10000 });
    await expect(badge).toHaveText('VOIDED');
  }

  async getPaginatedSubmissionErrors(pageSize: number): Promise<Set<string>> {
    const allText = new Set<string>();
    const errorLocator = this.page.locator(
        '.moj-alert__heading, .govuk-table__cell, .govuk-error-summary, .moj-banner--failure, [role="alert"]'
    );

    await errorLocator.first().waitFor({ state: 'visible', timeout: 15_000 });

    while (true) {
      for (const text of await errorLocator.allTextContents()) {
        allText.add(text);
      }

      const errorCount = await errorLocator.count();
      if (errorCount < pageSize) break;

      if (!(await goToPaginationPage(this.page, 'next'))) {
        console.log(' : No more errors to collect');
        break;
      }
    }

    console.log('✅ Finished pagination.');
    return allText;
  }

  async getDuplicateSubmissionError(): Promise<string> {
    const locator = this.page.locator('[data-sort-value*="Submission already exists"]');
    await locator.waitFor({ state: 'visible', timeout: 3_000 });

    const text = (await locator.getAttribute('data-sort-value'))?.trim() || '';
    return text;
  }

  async exportButtonIsNotVisible() {
    await expect(this.exportButton).not.toBeVisible();
  }

  async exportButtonIsVisible() {
    await expect(this.exportButton).toBeVisible();
  }

  async clickExportButton() {
    await this.exportButton.waitFor({ state: 'visible', timeout: 10_000 });

    const [download] = await Promise.all([
      this.page.waitForEvent('download', { timeout: 30_000 }),
      this.exportButton.click(),
    ]);

    const filename = download.suggestedFilename();
    console.log(`⬇️ Downloaded file: ${filename}`);
    return download;
  }

  private getExpectedSortableHeaders(areaOfLaw: string): {
    text: string[];
    numeric: string[];
  } {
    switch (areaOfLaw.toLowerCase()) {
      case 'legal help':
        return {
          text: [
            'Client Surname',
            'Client Forename',
            'UFN',
            'UCN',
            'Fee code',
            'Escape case',
            'Messages',
          ],
          numeric: ['Calculated value'],
        };

      case 'crime lower':
        return {
          text: [
            'Client Surname',
            'Client Initial',
            'UFN',
            'Fee code',
            'Date work concluded',
            'Escape case',
            'Messages',
          ],
          numeric: ['Calculated value'],
        };

      case 'mediation':
        return {
          text: [
            'Client 1 Surname',
            'Client 1 Forename',
            'Client 1 UCN',
            'Client 2 Surname',
            'Client 2 Forename',
            'Client 2 UCN',
            'Fee code',
            'Messages',
          ],
          numeric: ['Calculated value'],
        };

      default:
        return {
          text: [],
          numeric: ['Calculated value'],
        };
    }
  }

  async hasSortableHeader(headerText: string): Promise<boolean> {
    const header = this.page.locator('th[aria-sort]', {
      has: this.page.locator('button', { hasText: headerText }),
    });

    return (await header.count()) > 0;
  }

  async sortByHeader(headerText: string, direction: 'ascending' | 'descending') {
    const header = this.page.locator('th[aria-sort]', {
      has: this.page.locator('button', { hasText: headerText }),
    });

    await expect(header, `Sortable header "${headerText}" was not found`).toHaveCount(1, {
      timeout: 10_000,
    });

    const button = header.locator('button');

    for (let i = 0; i < 3; i++) {
      const current = await header.getAttribute('aria-sort');
      if (current === direction) return;

      await button.click();
      await expect(header).toHaveAttribute('aria-sort', direction, { timeout: 10_000 });
    }

    throw new Error(`Could not sort ${headerText} to ${direction}`);
  }

  async getColumnIndex(headerText: string): Promise<number> {
    const headers = this.claimsTable.locator('thead th');
    const count = await headers.count();

    for (let i = 0; i < count; i++) {
      const text = ((await headers.nth(i).textContent()) ?? '')
          .replace(/\s+/g, ' ')
          .trim();

      if (text.includes(headerText)) {
        return i;
      }
    }

    throw new Error(`Column "${headerText}" not found`);
  }

  async getColumnTextValuesByHeader(headerText: string): Promise<string[]> {
    const columnIndex = await this.getColumnIndex(headerText);
    const rows = this.claimsTable.locator('tbody tr');
    const rowCount = await rows.count();
    const values: string[] = [];

    for (let i = 0; i < rowCount; i++) {
      const cell = rows.nth(i).locator('td').nth(columnIndex);
      values.push(((await cell.textContent()) ?? '').replace(/\s+/g, ' ').trim());
    }

    return values;
  }

  async getColumnNumericValuesByHeader(headerText: string): Promise<number[]> {
    const columnIndex = await this.getColumnIndex(headerText);
    const rows = this.claimsTable.locator('tbody tr');
    const rowCount = await rows.count();
    const values: number[] = [];

    for (let i = 0; i < rowCount; i++) {
      const cell = rows.nth(i).locator('td').nth(columnIndex);
      const sortValue = await cell.getAttribute('data-sort-value');
      values.push(Number(sortValue));
    }

    return values;
  }

  async validateTextSortingByHeader(
      headerText: string,
      direction: 'ascending' | 'descending'
  ) {
    const values = await this.getColumnTextValuesByHeader(headerText);

    const expected = [...values].sort((a, b) =>
        direction === 'ascending'
            ? a.localeCompare(b)
            : b.localeCompare(a)
    );

    expect(values).toEqual(expected);
  }

  async validateNumericSortingByHeader(
      headerText: string,
      direction: 'ascending' | 'descending'
  ) {
    const values = await this.getColumnNumericValuesByHeader(headerText);

    const expected = [...values].sort((a, b) =>
        direction === 'ascending' ? a - b : b - a
    );

    expect(values).toEqual(expected);
  }

  async validateEscapeCaseSorting(direction: 'ascending' | 'descending') {
    const values = await this.getColumnTextValuesByHeader('Escape case');

    const rank = (value: string) => {
      const normalised = value.trim().toLowerCase();

      if (normalised === 'no') return 0;
      if (normalised === 'escaped') return 1;

      return 999;
    };

    const expected = [...values].sort((a, b) =>
        direction === 'ascending'
            ? rank(a) - rank(b)
            : rank(b) - rank(a)
    );

    expect(values).toEqual(expected);
  }

  async validateMessagesSorting(direction: 'ascending' | 'descending') {
    const values = await this.getColumnTextValuesByHeader('Messages');

    const rank = (value: string) => {
      const normalised = value.trim();
      return normalised.length > 0 ? 0 : 1;
    };

    const expected = [...values].sort((a, b) => {
      const rankDiff =
          direction === 'ascending'
              ? rank(a) - rank(b)
              : rank(b) - rank(a);

      if (rankDiff !== 0) return rankDiff;

      return direction === 'ascending'
          ? a.localeCompare(b)
          : b.localeCompare(a);
    });

    expect(values).toEqual(expected);
  }

  async hasPagination(): Promise<boolean> {
    const nextLink = this.page.locator('a', { hasText: 'Next' });
    const pageTwoLink = this.page.locator('a', { hasText: '2' });

    return (await nextLink.count()) > 0 || (await pageTwoLink.count()) > 0;
  }

  async goToFirstClaimsPage(): Promise<void> {
    while (await goToPaginationPage(this.page, 'previous')) {
      await this.page.waitForLoadState('domcontentloaded').catch(() => {});
      await this.claimsTable.waitFor({ state: 'visible', timeout: 10_000 });
    }
  }

  async getAllColumnTextValuesByHeader(headerText: string): Promise<string[]> {
    const allValues: string[] = [];

    await this.goToFirstClaimsPage();

    while (true) {
      const pageValues = await this.getColumnTextValuesByHeader(headerText);
      allValues.push(...pageValues);

      const movedToNextPage = await goToPaginationPage(this.page, 'next');
      if (!movedToNextPage) break;

      await this.page.waitForLoadState('domcontentloaded').catch(() => {});
      await this.claimsTable.waitFor({ state: 'visible', timeout: 10_000 });
    }

    return allValues;
  }

  async getAllColumnNumericValuesByHeader(headerText: string): Promise<number[]> {
    const allValues: number[] = [];

    await this.goToFirstClaimsPage();

    while (true) {
      const pageValues = await this.getColumnNumericValuesByHeader(headerText);
      allValues.push(...pageValues);

      const movedToNextPage = await goToPaginationPage(this.page, 'next');
      if (!movedToNextPage) break;

      await this.page.waitForLoadState('domcontentloaded').catch(() => {});
      await this.claimsTable.waitFor({ state: 'visible', timeout: 10_000 });
    }

    return allValues;
  }

  async validateTextSortingAcrossPagesByHeader(
      headerText: string,
      direction: 'ascending' | 'descending'
  ) {
    const values = await this.getAllColumnTextValuesByHeader(headerText);

    const expected = [...values].sort((a, b) =>
        direction === 'ascending'
            ? a.localeCompare(b)
            : b.localeCompare(a)
    );

    expect(values).toEqual(expected);
  }

  async validateNumericSortingAcrossPagesByHeader(
      headerText: string,
      direction: 'ascending' | 'descending'
  ) {
    const values = await this.getAllColumnNumericValuesByHeader(headerText);

    const expected = [...values].sort((a, b) =>
        direction === 'ascending' ? a - b : b - a
    );

    expect(values).toEqual(expected);
  }

  async validateEscapeCaseSortingAcrossPages(direction: 'ascending' | 'descending') {
    const values = await this.getAllColumnTextValuesByHeader('Escape case');

    const rank = (value: string) => {
      const normalised = value.trim().toLowerCase();

      if (normalised === 'no') return 0;
      if (normalised === 'escaped') return 1;

      return 999;
    };

    const expected = [...values].sort((a, b) =>
        direction === 'ascending'
            ? rank(a) - rank(b)
            : rank(b) - rank(a)
    );

    expect(values).toEqual(expected);
  }

  async validateMessagesSortingAcrossPages(direction: 'ascending' | 'descending') {
    const values = await this.getAllColumnTextValuesByHeader('Messages');

    const rank = (value: string) => {
      const normalised = value.trim();
      return normalised.length > 0 ? 0 : 1;
    };

    const expected = [...values].sort((a, b) => {
      const rankDiff =
          direction === 'ascending'
              ? rank(a) - rank(b)
              : rank(b) - rank(a);

      if (rankDiff !== 0) return rankDiff;

      return direction === 'ascending'
          ? a.localeCompare(b)
          : b.localeCompare(a);
    });

    expect(values).toEqual(expected);
  }

  async validateSortingForCurrentAreaOfLawAcrossPages() {
    await this.waitForPage();
    await this.goToFirstClaimsPage();

    const areaOfLaw = await this.getAreaOfLaw();
    const { text, numeric } = this.getExpectedSortableHeaders(areaOfLaw);

    for (const header of text) {
      if (!(await this.hasSortableHeader(header))) {
        console.log(`Skipping missing sortable header: ${header}`);
        continue;
      }

      await this.goToFirstClaimsPage();
      await this.sortByHeader(header, 'ascending');

      if (header === 'Escape case') {
        await this.validateEscapeCaseSortingAcrossPages('ascending');
      } else if (header === 'Messages') {
        await this.validateMessagesSortingAcrossPages('ascending');
      } else {
        await this.validateTextSortingAcrossPagesByHeader(header, 'ascending');
      }

      await this.goToFirstClaimsPage();
      await this.sortByHeader(header, 'descending');

      if (header === 'Escape case') {
        await this.validateEscapeCaseSortingAcrossPages('descending');
      } else if (header === 'Messages') {
        await this.validateMessagesSortingAcrossPages('descending');
      } else {
        await this.validateTextSortingAcrossPagesByHeader(header, 'descending');
      }
    }

    for (const header of numeric) {
      if (!(await this.hasSortableHeader(header))) {
        console.log(`Skipping missing sortable header: ${header}`);
        continue;
      }

      await this.goToFirstClaimsPage();
      await this.sortByHeader(header, 'ascending');
      await this.validateNumericSortingAcrossPagesByHeader(header, 'ascending');

      await this.goToFirstClaimsPage();
      await this.sortByHeader(header, 'descending');
      await this.validateNumericSortingAcrossPagesByHeader(header, 'descending');
    }
  }
}