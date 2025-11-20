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
  const immigrationPriorAuthorityNumber = maybeStr(rows, 'immigrationPriorAuthorityNumber');
  const caseConcludedDate = maybeStr(rows, 'caseConcludedDate');

  if (feeCode !== undefined) payload.feeCode = feeCode;
  if (startDate !== undefined) payload.startDate = startDate;
  if (uniqueFileNumber !== undefined) payload.uniqueFileNumber = uniqueFileNumber;
  if (policeStationId !== undefined) payload.policeStationId = policeStationId;
  if (policeStationSchemeId !== undefined) payload.policeStationSchemeId = policeStationSchemeId;
  if (representationOrderDate !== undefined) payload.representationOrderDate = representationOrderDate;
  if (immigrationPriorAuthorityNumber !== undefined) payload.immigrationPriorAuthorityNumber = immigrationPriorAuthorityNumber;
  if (caseConcludedDate !== undefined) payload.caseConcludedDate = caseConcludedDate;

  // Numbers (preserve 0, omit when row absent/blank/placeholder)
  const netProfitCosts = maybeNum(rows, 'netProfitCosts');
  const netCostOfCounsel = maybeNum(rows, 'netCostOfCounsel');
  const travelAndWaitingCosts = maybeNum(rows, 'travelAndWaitingCosts'); // <-- fixed key
  const netDisbursementAmount = maybeNum(rows, 'netDisbursementAmount');
  const disbursementVatAmount = maybeNum(rows, 'disbursementVatAmount');
  const numberOfMediationSessions = maybeNum(rows, 'numberOfMediationSessions');
  const netTravelCosts = maybeNum(rows, 'netTravelCosts');
  const netWaitingCosts = maybeNum(rows, 'netWaitingCosts');
  const detentionTravelAndWaitingCosts = maybeNum(rows, 'detentionTravelAndWaitingCosts');
  const jrFormFilling = maybeNum(rows, 'jrFormFilling');

  if (netProfitCosts !== undefined) payload.netProfitCosts = netProfitCosts;
  if (netCostOfCounsel !== undefined) payload.netCostOfCounsel = netCostOfCounsel;
  if (travelAndWaitingCosts !== undefined) payload.travelAndWaitingCosts = travelAndWaitingCosts;
  if (netDisbursementAmount !== undefined) payload.netDisbursementAmount = netDisbursementAmount;
  if (disbursementVatAmount !== undefined) payload.disbursementVatAmount = disbursementVatAmount;
  if (numberOfMediationSessions !== undefined) payload.numberOfMediationSessions = numberOfMediationSessions;
  if (netTravelCosts !== undefined) payload.netTravelCosts = netTravelCosts;
  if (netWaitingCosts !== undefined) payload.netWaitingCosts = netWaitingCosts;
  if (detentionTravelAndWaitingCosts !== undefined) payload.detentionTravelAndWaitingCosts = detentionTravelAndWaitingCosts;
  if (jrFormFilling !== undefined) payload.jrFormFilling = jrFormFilling;

  // Booleans (only include if present; false is preserved)
  const vatIndicator = maybeBool(rows, 'vatIndicator');
  const londonRate = maybeBool(rows, 'londonRate');
  if (vatIndicator !== undefined) payload.vatIndicator = vatIndicator;
  if (londonRate !== undefined) payload.londonRate = londonRate;

  // boltOns: include only fields that appear in the feature (and preserve 0)
  const boltOns: Record<string, number> = {};

  const boltOnAdjournedHearing   = maybeNum(rows, 'boltOnAdjournedHearing');
  const boltOnHomeOfficeInterview= maybeNum(rows, 'boltOnHomeOfficeInterview');
  const boltOnCmrhOral           = maybeNum(rows, 'boltOnCmrhOral');
  const boltOnCmrhTelephone      = maybeNum(rows, 'boltOnCmrhTelephone');
  const boltOnSubstantiveHearing = maybeNum(rows, 'boltOnSubstantiveHearing');

  if (boltOnAdjournedHearing !== undefined)   boltOns.boltOnAdjournedHearing = boltOnAdjournedHearing;
  if (boltOnHomeOfficeInterview !== undefined)boltOns.boltOnHomeOfficeInterview = boltOnHomeOfficeInterview;
  if (boltOnCmrhOral !== undefined)           boltOns.boltOnCmrhOral = boltOnCmrhOral;
  if (boltOnCmrhTelephone !== undefined)      boltOns.boltOnCmrhTelephone = boltOnCmrhTelephone;
  if (boltOnSubstantiveHearing !== undefined) boltOns.boltOnSubstantiveHearing = boltOnSubstantiveHearing;

  if (Object.keys(boltOns).length > 0) {
    payload.boltOns = boltOns;
  }

  this.setPayload(payload);
});

When('I POST {string} with the payload', async function (this: World, endpoint: string) {
  console.log(JSON.stringify(this.requestBody, null, 2));
  await this.post(endpoint, this.requestBody);
});