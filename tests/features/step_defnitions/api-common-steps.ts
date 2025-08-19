import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { DataTable } from '@cucumber/cucumber';
import World from '../support/world';

Given('I have an initialized API client', function (this: World) {
  expect(this.client).toBeDefined();
});

Then('the JSON path {string} should equal number {float}', function (this: World, jsonPath: string, expected: number) {
  const actual = this.getByPath(this.response?.data ?? {}, jsonPath);
  expect(typeof actual).toBe('number');
  expect(actual as number).toBeCloseTo(expected, 2);
});

Then('the JSON path {string} should equal {string}', function (this: World, jsonPath: string, expected: string) {
  const actual = this.getByPath(this.response?.data ?? {}, jsonPath);
  expect(String(actual)).toBe(expected);
});
Then('the response status should be {int}', function (this: World, statusCode: number) {
  const actual = this.response?.status;
  if (actual !== statusCode) {
    // helpful debug
    console.error('Expected status:', statusCode, 'but got:', actual);
    console.error('Response body:', JSON.stringify(this.response?.data, null, 2));
  }
  expect(actual).toBe(statusCode);
});

Then('print the response body', function (this: World) {
  //  when debugging 400s
  if (!this.response) {
    console.error('No response to print');
    return;
  }
  console.log('Response status:', this.response.status);
  console.log('Response headers:', JSON.stringify(this.response.headers, null, 2));
  console.log('Response body:', JSON.stringify(this.response?.data, null, 2));
});