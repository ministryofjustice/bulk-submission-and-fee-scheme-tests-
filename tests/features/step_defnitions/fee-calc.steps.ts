import { Given, When, Then } from '@cucumber/cucumber';
import { expect, request } from '@playwright/test';
import type { DataTable } from '@cucumber/cucumber';
import World from '../support/world';

const isPlaceholder = (v: unknown) =>
    typeof v === 'string' && /^<[^>]+>$/.test(v.trim());

/** Only include string field if the row exists AND value is neither blank nor a placeholder */
function maybeStr(rows: Record<string, string>, key: string): string | undefined {
  if (!Object.prototype.hasOwnProperty.call(rows, key)) return undefined; // row not present -> omit
  const raw = rows[key];
  if (raw === undefined || raw === null) return undefined;
  const s = String(raw).trim();
  if (s === '' || isPlaceholder(s)) return undefined; // blank/placeholder -> omit
  return s; // include as-is
}

/** Only include numeric field if the row exists AND value is non-blank/non-placeholder; preserves 0 */
function maybeNum(rows: Record<string, string>, key: string): number | undefined {
  if (!Object.prototype.hasOwnProperty.call(rows, key)) return undefined; // row not present -> omit
  const raw = rows[key];
  if (raw === undefined || raw === null) return undefined;
  const s = String(raw).trim();
  if (s === '' || isPlaceholder(s)) return undefined; // blank/placeholder -> omit
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined; // invalid number -> omit
}

/** Only include boolean field if the row exists; accepts 'true'/'false' (case-insensitive) */
function maybeBool(rows: Record<string, string>, key: string): boolean | undefined {
  if (!Object.prototype.hasOwnProperty.call(rows, key)) return undefined; // row not present -> omit
  const raw = rows[key];
  if (raw === undefined || raw === null) return undefined;
  const s = String(raw).trim().toLowerCase();
  if (s === '' || isPlaceholder(s)) return undefined; // blank/placeholder -> omit
  if (s === 'true' || s === 'yes') return true;
  if (s === 'false' || s === 'no') return false;
  return undefined; // unrecognised -> omit
}

Given('a fee calculation payload with:', function (this: World, table: DataTable) {
  const rows = table.rowsHash() as Record<string, string>;
  const payload: Record<string, any> = {};

  // Strings
  const feeCode = maybeStr(rows, 'feeCode');
  const startDate = maybeStr(rows, 'startDate');
  const uniqueFileNumber = maybeStr(rows, 'uniqueFileNumber');
  const policeStationId = maybeStr(rows, 'policeStationId');
  const policeStationSchemeId = maybeStr(rows, 'policeStationSchemeId');
  const representationOrderDate = maybeStr(rows, 'representationOrderDate');

  if (feeCode !== undefined) payload.feeCode = feeCode;
  if (startDate !== undefined) payload.startDate = startDate;
  if (uniqueFileNumber !== undefined) payload.uniqueFileNumber = uniqueFileNumber;
  if (policeStationId !== undefined) payload.policeStationId = policeStationId;
  if (policeStationSchemeId !== undefined) payload.policeStationSchemeId = policeStationSchemeId;
  if (representationOrderDate !== undefined) payload.representationOrderDate = representationOrderDate;

  // Numbers (preserve 0, omit when row absent/blank/placeholder)
  const netProfitCosts = maybeNum(rows, 'netProfitCosts');
  const netCostOfCounsel = maybeNum(rows, 'netCostOfCounsel');
  const travelAndWaitingCosts = maybeNum(rows, 'travelAndWaitingCosts'); // <-- fixed key
  const netDisbursementAmount = maybeNum(rows, 'netDisbursementAmount');
  const disbursementVatAmount = maybeNum(rows, 'disbursementVatAmount');
  const numberOfMediationSessions = maybeNum(rows, 'numberOfMediationSessions');
  const netTravelCosts = maybeNum(rows, 'netTravelCosts');
  const netWaitingCosts = maybeNum(rows, 'netWaitingCosts');

  if (netProfitCosts !== undefined) payload.netProfitCosts = netProfitCosts;
  if (netCostOfCounsel !== undefined) payload.netCostOfCounsel = netCostOfCounsel;
  if (travelAndWaitingCosts !== undefined) payload.travelAndWaitingCosts = travelAndWaitingCosts;
  if (netDisbursementAmount !== undefined) payload.netDisbursementAmount = netDisbursementAmount;
  if (disbursementVatAmount !== undefined) payload.disbursementVatAmount = disbursementVatAmount;
  if (numberOfMediationSessions !== undefined) payload.numberOfMediationSessions = numberOfMediationSessions;
  if (netTravelCosts !== undefined) payload.netTravelCosts = netTravelCosts;
  if (netWaitingCosts !== undefined) payload.netWaitingCosts = netWaitingCosts;

  // Booleans (only include if present; false is preserved)
  const vatIndicator = maybeBool(rows, 'vatIndicator');
  const londonRate = maybeBool(rows, 'londonRate');
  if (vatIndicator !== undefined) payload.vatIndicator = vatIndicator;
  if (londonRate !== undefined) payload.londonRate = londonRate;

  // boltOns: include only fields that appear in the feature (and preserve 0)
  const boltOnAdjournedHearing = maybeNum(rows, 'boltOnAdjournedHearing');
  // Add further bolt-on keys here if you ever expose them in the feature table
  if (boltOnAdjournedHearing !== undefined) {
    payload.boltOns = { boltOnAdjournedHearing };
  }

  this.setPayload(payload);
});

When('I POST {string} with the payload', async function (this: World, endpoint: string) {
  // For visibility while debugging:
  console.log(JSON.stringify(this.requestBody, null, 2));
  await this.post(endpoint, this.requestBody);
});