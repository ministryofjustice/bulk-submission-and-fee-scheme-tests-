// // tests/features/step_definitions/loginPage.steps.ts
// import { Given, When, Then } from '@cucumber/cucumber';
// import { expect } from '@playwright/test';
// import { SampleLoginPage } from '../../pages/SampleLoginPage';
// import type { CustomWorld } from '../support/world';
//
// Given('I navigate to the login page', async function (this: CustomWorld) {
//   // World.openBrowser() has already run in your @ui Before‐hook
//   this.sampleLoginPage = new SampleLoginPage(this.page!);
//   await this.sampleLoginPage.navigateTo();
// });
//
// When('I enter username {string}', async function (this: CustomWorld, username: string) {
//   await this.sampleLoginPage!.enterUsername(username);
// });
//
// When('I enter password {string}', async function (this: CustomWorld, password: string) {
//   await this.sampleLoginPage!.enterPassword(password);
// });
//
// When('I click the login button', async function (this: CustomWorld) {
//   // If you haven’t added clickLogin() to your POM, you could do:
//   // await this.page!.click('button[type="submit"]');
//   await this.sampleLoginPage!.clickLogin();
// });
//
// Then('I should be redirected to the secure area', async function (this: CustomWorld) {
//   // The URL will end in /secure on success
//   await expect(this.page!).toHaveURL(/\/secure$/);
// });
//
// Then('I should see a flash message saying {string}', async function (this: CustomWorld, message: string) {
//   // The flash banner has id="flash"
//   const flash = this.page!.locator('#flash');
//   await expect(flash).toContainText(message);
// });
