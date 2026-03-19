import {expect, Page, Locator} from '@playwright/test';
import { BasePage } from './BasePage';

type FeeCalculationRow = {
  label: string;
  entered: string;
  calculated: string;
  notes: string;
};

class ClaimDetailPage extends BasePage {
  private pageHeading: Locator;
  private feeRows: Locator;

  constructor(page: Page) {
    super(page, 'Claim -', 'Print this page');
    this.pageHeading = page.locator('h1.govuk-heading-l', { hasText: 'Claim -' });
    this.feeRows = page.locator('table.govuk-table tbody tr');
  }

  async waitForPage() {
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async getFeeCalculationRow(targetLabel: string): Promise<FeeCalculationRow | undefined> {
    const rowCount = await this.feeRows.count();
    const normalizedTarget = targetLabel.trim().toLowerCase();

    for (let i = 0; i < rowCount; i++) {
      const row = this.feeRows.nth(i);
      const labelText = ((await row.locator('th').innerText()) || '').replace(/\s+/g, ' ').trim();

      if (!labelText) continue;
      if (!labelText.toLowerCase().includes(normalizedTarget)) continue;

      const cells = row.locator('td');
      const entered = await this.getCellText(cells, 0);
      const calculated = await this.getCellText(cells, 1);
      const notes = await this.getCellText(cells, 2);

      return {
        label: labelText,
        entered,
        calculated,
        notes,
      };
    }

    return undefined;
  }

  private async getCellText(cells: Locator, index: number): Promise<string> {
    if ((await cells.count()) <= index) return '';
    const value = await cells.nth(index).innerText();
    return (value || '').replace(/\s+/g, ' ').trim();
  }

  async getFeeCalculationHeadings(): Promise<string[]> {
    const count = await this.feeRows.count();
    const headings: string[] = [];

    for (let i = 0; i < count; i++) {
      const label = ((await this.feeRows.nth(i).locator('th').innerText()) || '').replace(/\s+/g, ' ').trim();
      if (label) headings.push(label);
    }

    return headings;
  }

  async expectVoidedBanner(): Promise<void> {
    const banner = this.page.locator('.moj-alert--error', { hasText: 'This claim has been voided' });
    await expect(banner).toBeVisible({ timeout: 10000 });
    await expect(banner).toContainText('This claim has been voided');
  }
}

export { ClaimDetailPage, type FeeCalculationRow };
