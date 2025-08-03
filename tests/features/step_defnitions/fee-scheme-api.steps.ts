// tests/features/step_definitions/fee-scheme-api.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import type { World as CustomWorld } from '../support/world';
import axios from 'axios';

Given('I have an initialized API client', function (this: CustomWorld) {
  if (!this.client) {
    throw new Error('API client is not initialized');
  }
});

When('I GET {string}', async function (this: CustomWorld, path: string) {
  // Derive the full URL for debugging
  const baseUrl = this.client.defaults.baseURL || process.env.API_BASE_URL;
  const fullUrl = `${baseUrl}${path}`;
  console.log(`Calling GET ${fullUrl}`);
  
  try {
    this.response = await this.client.get(path);
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response) {
      // Capture non-2xx responses for assertion
      this.response = err.response;
    } else {
      throw err;
    }
  }
});

Then('the response status should be {int}', function (this: CustomWorld, status: number) {
  const actual = this.response?.status;
  assert.equal(actual, status,
    `Expected status ${status} but got ${actual}`);
});

Then('the JSON path {string} should equal {string}', function 
  (this: CustomWorld, jsonPath: string, expected: string) 
{
  const data = this.response?.data;
  const actual = jsonPath
    .split('.')
    .reduce((o: any, k: string) => o && o[k], data);
  assert.equal(actual, expected,
    `Expected JSON path "${jsonPath}" to be "${expected}" but got "${actual}"`);
});
