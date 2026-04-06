import { expect, Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

type FeeCalculationRow = {
  label: string;
  entered: string;
  calculated: string;
  notes: string;
};

class ClaimDetailPage extends BasePage {
  private pageHeading: Locator;
  private valuesCard: Locator;
  private totalClaimValueCard: Locator;

  constructor(page: Page) {
    super(page, 'Claim Details', 'Print this page');

    this.pageHeading = page.locator('h1.govuk-heading-l', {
      hasText: 'Claim Details',
    });

    this.valuesCard = page.locator('.govuk-summary-card').filter({
      has: page.locator('.govuk-summary-card__title', { hasText: 'Values' }),
    });

    this.totalClaimValueCard = page.locator('.govuk-summary-card').filter({
      has: page.locator('.govuk-summary-card__title', { hasText: 'Total claim value' }),
    });
  }

  async waitForPage() {
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async getFeeCalculationRow(targetLabel: string): Promise<FeeCalculationRow | null> {
    return this.getTableRow(this.valuesCard, targetLabel, true);
  }

  async getTotalClaimValueRow(targetLabel: string): Promise<FeeCalculationRow | null> {
    return this.getTableRow(this.totalClaimValueCard, targetLabel, false);
  }

  async getFeeCalculationHeadings(): Promise<string[]> {
    const rows = this.valuesCard.locator('tbody tr');
    const count = await rows.count();
    const headings: string[] = [];

    for (let i = 0; i < count; i++) {
      const label = ((await rows.nth(i).locator('th').innerText()) || '')
          .replace(/\s+/g, ' ')
          .trim();

      if (label) headings.push(label);
    }

    return headings;
  }

  async expectVoidedBanner(): Promise<void> {
    const banner = this.page.locator('.moj-alert--error', {
      hasText: 'This claim has been voided',
    });
    await expect(banner).toBeVisible({ timeout: 10000 });
    await expect(banner).toContainText('This claim has been voided');
  }

  private async getTableRow(
      card: Locator,
      targetLabel: string,
      hasNotes: boolean
  ): Promise<FeeCalculationRow | null> {
    const rows = card.locator('tbody tr');
    const rowCount = await rows.count();
    const normalizedTarget = this.normalize(targetLabel);

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const labelText = ((await row.locator('th').innerText()) || '')
          .replace(/\s+/g, ' ')
          .trim();

      if (!labelText) continue;
      if (this.normalize(labelText) !== normalizedTarget) continue;

      const cells = row.locator('td');

      const calculated = await this.getCellText(cells, 0);
      const entered = await this.getCellText(cells, 1);
      const notes = hasNotes ? await this.getCellText(cells, 2) : '';

      return {
        label: labelText,
        entered,
        calculated,
        notes,
      };
    }

    return null;
  }

  private async getCellText(cells: Locator, index: number): Promise<string> {
    if ((await cells.count()) <= index) return '';
    const value = await cells.nth(index).innerText();
    return (value || '').replace(/\s+/g, ' ').trim();
  }

  private normalize(value: string): string {
    return value.replace(/\s+/g, ' ').trim().toLowerCase();
  }
}

export { ClaimDetailPage, type FeeCalculationRow };