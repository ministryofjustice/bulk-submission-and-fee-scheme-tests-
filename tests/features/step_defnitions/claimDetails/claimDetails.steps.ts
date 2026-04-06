import { ClaimDetailPage } from '../../../pages/ClaimDetailPage';
import { expect } from '@playwright/test';
import {DataTable, Then} from '@cucumber/cucumber';
import World from '../../support/world';


const asCurrency = (value?: string) =>
    value && value.trim() !== ''
        ? `£${Number(value).toFixed(2)}`
        : '';

Then(
    'the fee calculation should show the entered and calculated values correctly',
    async function (this: World) {

        const claimPage = new ClaimDetailPage(this.page!);
        await claimPage.waitForPage();

        // Net Disbursements
        const netDisb = await claimPage.getFeeCalculationRow('Net Disbursements');
        expect(netDisb).toBeTruthy();
        expect(netDisb!.entered).toBe('£20.00');
        expect(netDisb!.calculated).toBe('£20.00');

        // Disbursement VAT
        const vat = await claimPage.getFeeCalculationRow('Disbursement VAT');
        expect(vat).toBeTruthy();
        expect(vat!.entered).toBe('£10.50');
        expect(vat!.calculated).toBe('£10.50');

        // Total
        const total = await claimPage.getFeeCalculationRow('Total');
        expect(total).toBeTruthy();
        expect(total!.calculated).toBe('£269.50');
    }
);

Then(
    'the total claim value should show the following values',
    async function (this: World, dataTable: DataTable) {
        const claimPage = new ClaimDetailPage(this.page!);
        await claimPage.waitForPage();

        const rows = dataTable.hashes();

        for (const row of rows) {
            const label = row.Item;
            const expectedEntered =
                row.Entered && row.Entered.trim() !== ''
                    ? `£${Number(row.Entered).toFixed(2)}`
                    : '';
            const expectedCalculated =
                row.Calculated && row.Calculated.trim() !== ''
                    ? `£${Number(row.Calculated).toFixed(2)}`
                    : '';

            const totalRow = await claimPage.getTotalClaimValueRow(label);

            expect(totalRow, `Total claim row "${label}" was not found`).toBeTruthy();

            if (expectedEntered) {
                expect(totalRow!.entered).toBe(expectedEntered);
            }

            if (expectedCalculated) {
                expect(totalRow!.calculated).toBe(expectedCalculated);
            }
        }
    }
);

Then(
    'the fee calculation should show the following values',
    async function (this: World, dataTable: DataTable) {

            const claimPage = new ClaimDetailPage(this.page!);
            await claimPage.waitForPage();

            const rows = dataTable.hashes();

            for (const row of rows) {
                    const label = row.Item;
                    const expectedEntered = asCurrency(row.Entered);
                    const expectedCalculated = asCurrency(row.Calculated);

                    const feeRow = await claimPage.getFeeCalculationRow(label);

                    expect(
                        feeRow,
                        `Fee calculation row "${label}" was not found`
                    ).toBeTruthy();

                    if (expectedEntered) {
                            expect(
                                feeRow!.entered,
                                `${label} entered value`
                            ).toBe(expectedEntered);
                    }

                    if (expectedCalculated) {
                            expect(
                                feeRow!.calculated,
                                `${label} calculated value`
                            ).toBe(expectedCalculated);
                    }
            }
    }
);

Then(
    'the crime fee calculation should reflect the entered values',
    async function (this: World) {

        if (!this.expectedCrimeClaim) {
            throw new Error('No expected crime claim found in test context');
        }

        const page = new ClaimDetailPage(this.page!);
        await page.waitForPage();

        const {
            netProfitCosts,
            netTravelCosts,
            netWaitingCosts,
            netDisbursementAmount,
            disbursementVatAmount,
            expectedTotal,
        } = this.expectedCrimeClaim;

        // -----------------------
        // Net Profit Cost
        // -----------------------
        if (netProfitCosts) {
            const row = await page.getFeeCalculationRow('Net Profit Cost');
            expect(row, 'Net Profit Cost row missing').toBeTruthy();
            expect(row!.entered).toBe(`£${Number(netProfitCosts).toFixed(2)}`);
        }

        // -----------------------
        // Net Disbursements
        // -----------------------
        if (netDisbursementAmount) {
            const row = await page.getFeeCalculationRow('Net Disbursements');
            expect(row, 'Net Disbursements row missing').toBeTruthy();
            expect(row!.entered).toBe(`£${Number(netDisbursementAmount).toFixed(2)}`);
        }

        // -----------------------
        // Disbursement VAT
        // -----------------------
        if (disbursementVatAmount) {
            const row = await page.getFeeCalculationRow('Disbursement VAT');
            expect(row, 'Disbursement VAT row missing').toBeTruthy();
            expect(row!.entered).toBe(`£${Number(disbursementVatAmount).toFixed(2)}`);
        }

        // -----------------------
        // Travel + Waiting Costs
        // -----------------------
        if (netTravelCosts || netWaitingCosts) {
            const totalTravel =
                Number(netTravelCosts || 0) + Number(netWaitingCosts || 0);

            const row = await page.getFeeCalculationRow('Travel and Waiting');
            expect(row, 'Travel and Waiting Costs row missing').toBeTruthy();
            expect(row!.entered).toBe(`£${totalTravel.toFixed(2)}`);
        }

        // -----------------------
        // Final Total
        // -----------------------
        if (expectedTotal) {
            const row = await page.getFeeCalculationRow('Total');
            expect(row, 'Total row missing').toBeTruthy();
            expect(row!.calculated).toBe(expectedTotal);
        }
    }
);

Then(
    'the crime fee calculation should show the following values',
    async function (this: World, dataTable) {

        const expectedRows = dataTable.hashes();

        const page = new ClaimDetailPage(this.page!);
        await page.waitForPage();

        for (const row of expectedRows) {
            const { Item, Entered, Calculated } = row;

            const feeRow = await page.getFeeCalculationRow(Item);
            expect(feeRow, `Missing row for ${Item}`).toBeTruthy();

            if (Entered !== undefined && Entered !== '') {
                expect(feeRow!.entered).toBe(`£${Number(Entered).toFixed(2)}`);
            }

            if (Calculated !== undefined && Calculated !== '') {
                expect(feeRow!.calculated).toBe(`£${Number(Calculated).toFixed(2)}`);
            }
        }
    }
);