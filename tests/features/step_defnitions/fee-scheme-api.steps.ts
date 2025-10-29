// tests/features/step_definitions/fee-scheme-api.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import type { World as CustomWorld } from '../support/world';
import axios from 'axios';


When('I GET {string}', async function (this: CustomWorld, path: string) {
  // Derive the full URL for debugging
  const baseUrl = this.client.defaults.baseURL || process.env.FSP_API_BASE_URL;
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




