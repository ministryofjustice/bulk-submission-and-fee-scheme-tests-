import {When, Then} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import {getContext} from '../../../utils/apiClient';

When('I send a GET request to {string}', async function (endpoint: string) {
  const context = await getContext();
  this.response = await context.get(endpoint);
  this.data = await this.response.json();
});

Then('the response status should be {int}', function (status: string) {
  expect(this.response.status()).toBe(status);
});

Then('the response should be an array', function () {
  expect(Array.isArray(this.data)).toBe(true);
});
