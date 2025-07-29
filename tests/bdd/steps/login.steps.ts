const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

Given('I am on the login screen', async function () {
  // Launch application
});

When('I enter my credentials', async function () {
  // Enter credentials
});

Then('I should be redirected to the home page', async function () {
  // Check redirect works
});