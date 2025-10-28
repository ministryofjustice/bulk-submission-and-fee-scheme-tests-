// tests/features/step_defnitions/api-common-steps.ts
import { Given, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import World from '../support/world';

/** Coerce an unknown value to a number, tolerating numeric strings & symbols. */
function coerceNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string') {
    // allow things like "£323.86", "323.86 GBP", "1,234.50"
    const cleaned = value.replace(/[,]/g, '').replace(/[^\d.+\-Ee]/g, '').trim();
    if (!cleaned) return undefined;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

Given('I have an initialized API client', function (this: World) {
  expect(this.client).toBeDefined();
});

Then(
    'the JSON path {string} should equal number {float}',
    async function (this: World, jsonPath: string, expected: number) {
      const data = this.response?.data ?? {};
      const actual = this.getByPath(data, jsonPath);

      if (actual === undefined) {
        // Attach some diagnostics to the report to make debugging easy
        if (this.attach) {
          try {
            await this.attach(
                JSON.stringify(
                    {
                      message: `Value at path "${jsonPath}" is undefined.`,
                      availableKeysAtRoot: Object.keys(data ?? {}),
                      sampleOfResponse: data,
                    },
                    null,
                    2
                ),
                'application/json'
            );
          } catch {}
        }
        throw new Error(`Value at path "${jsonPath}" is undefined in response.`);
      }

      const numeric = coerceNumber(actual);

      if (numeric === undefined) {
        if (this.attach) {
          try {
            await this.attach(
                JSON.stringify(
                    { message: 'Non-numeric value at JSON path.', jsonPath, actual, type: typeof actual },
                    null,
                    2
                ),
                'application/json'
            );
          } catch {}
        }
        throw new Error(
            `Value at path "${jsonPath}" is not a finite number: ${JSON.stringify(actual)}`
        );
      }

      // Compare with tolerance of 2 decimal places (avoids tiny FP rounding mismatches)
      expect(numeric).toBeCloseTo(expected, 2);
    }
);

Then(
    'the JSON path {string} should equal {string}',
    function (this: World, jsonPath: string, expected: string) {
      const data = this.response?.data ?? {};
      const actual = this.getByPath(data, jsonPath);

      if (actual === undefined) {
        throw new Error(`Value at path "${jsonPath}" is undefined in response.`);
      }

      expect(String(actual)).toBe(expected);
    }
);

Then('the response status should be {int}', function (this: World, statusCode: number) {
  const actual = this.response?.status;

  if (actual !== statusCode) {
    // rich debug to the console (also shows up in CI logs)
    console.error('Expected status:', statusCode, 'but got:', actual);
    console.error('Response body:', JSON.stringify(this.response?.data, null, 2));
  }

  expect(actual).toBe(statusCode);
});

Then('print the response body', function (this: World) {
  if (!this.response) {
    console.error('No response to print');
    return;
  }
  console.log('Response status:', this.response.status);
  console.log('Response headers:', JSON.stringify(this.response.headers, null, 2));
  console.log('Response body:', JSON.stringify(this.response.data, null, 2));
});
