// testFile.spec.js
import {test, expect} from '@playwright/test';
import {LoginPage} from "./ pages/LoginPage";

test('Should log the user in', async ({ page }) => {
  const myPage = new LoginPage(page);
  await myPage.navigateTo();
  await myPage.enterUsername("DT_SCRIPT_USER4");
  await myPage.enterPassword("password");
  await myPage.submit();

  expect(page.url()).toBe('http://localhost:8082/');
});