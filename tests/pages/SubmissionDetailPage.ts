import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

class SubmissionDetailPage extends BasePage {
  private header: Locator;
  private submissionReference: Locator;

  constructor(page: Page) {
    super(page, 'View submission', 'View submission');
    this.header = page.locator('h1.govuk-heading-l', { hasText: 'View submission' });
    this.submissionReference = page.locator('dd span.govuk-!-font-weight-bold');
  }

  async waitForPage() {
    await this.header.waitFor({ state: 'visible' });
  }

  async getSubmissionReference(): Promise<string> {
    return this.submissionReference.innerText();
  }

  async getSubmissionDetails(): Promise<Record<string, string>> {
    return {
      'Submission reference': await this.page.locator('dt:has-text("Submission reference") + dd').innerText(),
      'Submission period': await this.page.locator('dt:has-text("Submission period") + dd').innerText(),
      'Office account': await this.page.locator('dt:has-text("Office account") + dd').innerText(),
      'Submission value': await this.page.locator('dt:has-text("Submission value") + dd').innerText(),
      'Area of law': await this.page.locator('dt:has-text("Area of law") + dd').innerText(),
      'Submitted': await this.page.locator('dt:has-text("Submitted") + dd').innerText(),
    };
  }

async getSubmissionCosts(): Promise<Record<string, string>> {
  // Wait for the header first to ensure the table is rendered
  const claimsHeader = this.page.locator('h2#claims');
  await claimsHeader.waitFor({ state: 'visible' });

  // Select all rows after the claims header
  const rows = this.page.locator('div.govuk-grid-column-two-thirds >> h2#claims >> xpath=following-sibling::table/tbody/tr');
  const rowCount = await rows.count();
  const costs: Record<string, string> = {};

  for (let i = 0; i < rowCount; i++) {
    const label = await rows.nth(i).locator('th').innerText();
    const value = await rows.nth(i).locator('td').innerText();
    costs[label] = value;
  }

  return costs;
}


  // New method to get summary claims (Profit costs, Disbursements, etc.)
//   async getSubmissionCosts(): Promise<Record<string, string>> {
//     const rows = this.page.locator('div:has(h2#claims) table tbody tr');
//     const result: Record<string, string> = {};
//     const count = await rows.count();
//
//     for (let i = 0; i < count; i++) {
//       const label = await rows.nth(i).locator('th').innerText();
//       const value = await rows.nth(i).locator('td').innerText();
//       result[label] = value;
//     }
//
//     return result;
//   }

  // New method to get all individual claims
  async getAllClaims(): Promise<Record<string, string>[]> {
    const rows = this.page.locator('table[data-moj-sortable-table-init] tbody tr');
    const claims = [];
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      claims.push({
        'No.': await row.locator('[id^="line-number"]').innerText(),
        UFN: await row.locator('[id^="unique-file-number"]').innerText(),
        UCN: await row.locator('[id^="unique-client-number"]').innerText(),
        Client: await row.locator('[id^="client-name"]').innerText(),
        Category: await row.locator('[id^="category"]').innerText(),
        Matter: await row.locator('[id^="matter"]').innerText(),
        'Concluded/claimed': await row.locator('[id^="concluded-claimed"]').innerText(),
        'Fee type': await row.locator('[id^="fee-type"]').innerText(),
        'Fee code': await row.locator('[id^="fee-code"]').innerText(),
        'Claim value': await row.locator('[id^="claim-value"]').innerText(),
      });
    }

    return claims;
  }
}

export { SubmissionDetailPage };
