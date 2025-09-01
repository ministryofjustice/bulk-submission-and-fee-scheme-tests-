import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { DataTable } from '@cucumber/cucumber';
import World from '../support/world';


Given('a fee calculation payload with:', function (this: World, table: DataTable) {
  const rows = table.rowsHash();

  this.setPayload({
    feeCode: rows.feeCode,
    startDate: rows.startDate,
    netProfitCosts: Number(rows.netProfitCosts),
    netCostOfCounsel: Number(rows.netCostOfCounsel),
    travelAndWaitingCosts: Number(rows.travelAndWaitingCosts || 0),
    netDisbursementAmount: Number(rows.netDisbursementAmount),
    disbursementVatAmount: Number(rows.disbursementVatAmount),
    vatIndicator: rows.vatIndicator === 'true',
    disbursementPriorAuthority: undefined,
    boltOns: {
      boltOnAdjournedHearing: Number(rows.boltOnAdjournedHearing || 0),
      boltOnDetentionTravelWaitingCosts: 0,
      boltOnJrFormFilling: 0,
      boltOnCmrhOral: 0,
      boltOnCrmhTelephone: 0,
      boltOnAdditionalTravel: 0
    },
    numberOfMediationSessions: Number(rows.numberOfMediationSessions ?? 0)
  });
});


When('I POST {string} with the payload', async function (this: World, endpoint: string) {
  await this.post(endpoint, this.requestBody);
});


