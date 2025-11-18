import {Page} from '@playwright/test';

export async function goToPaginationPage(page: Page, pageRole: string): Promise<boolean>{
  // 🧭 rel="next" or rel="prev" link to the next page
  const nextButton = page.locator(`a.govuk-pagination__link[rel="${pageRole}"]`);

  if (!(await nextButton.isVisible())) {
    console.log('🚫 No more Next button visible — stopping pagination.');
    return false;
  }

  // 🕒 Wait for page content to change after clicking next
  const firstRowBefore = await page.locator('table.govuk-table tbody tr:first-child').innerText();

  await Promise.all([
    nextButton.click(),
      page.waitForFunction(
        (prevText) => {
          const firstRow = document.querySelector('table.govuk-table tbody tr:first-child');
          return firstRow && firstRow.textContent !== prevText;
        },
        firstRowBefore,
        { timeout: 10000 }
      ),
  ]);

  await page.waitForTimeout(500); // brief wait for stability

  return true;
}