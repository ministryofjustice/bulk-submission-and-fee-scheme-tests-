import path from 'path';
import { GenerateCrimeFiles } from './generateCrimeFiles';
import { claimOptions } from '../claimOptions';

type Format = 'csv' | 'txt' | 'xml';

/**
 * Crime calculation-focused generator.
 *
 * Purpose:
 * - Accept precise financial inputs
 * - Normalise VAT + numeric fields
 * - Delegate to GenerateCrimeFiles (no mutation)
 */
export async function GenerateCrimeFilesForCalculations(
    files: number,
    outcomes: number,
    format: Format,
    options: {
        claims: any[];
        office?: string;
    }
): Promise<{ filePaths: string[]; office: string }> {

    function normaliseVat(input?: string): 'Y' | 'N' | undefined {
        if (!input) return undefined;

        const value = input.toString().trim().toUpperCase();

        if (value === 'Y' || value === 'YES') return 'Y';
        if (value === 'N' || value === 'NO') return 'N';

        return undefined;
    }

    const claims: claimOptions[] = options.claims.map(row => ({
        feeCode: row.feeCode,
        ufn: row.uniqueFileNumber,

        caseStartDate: row.startDate,
        repOrderDate: row.representationOrderDate,

        profitCost: row.netProfitCosts
            ? Number(row.netProfitCosts)
            : undefined,

        travelCost: row.netTravelCosts
            ? Number(row.netTravelCosts)
            : undefined,

        travelWaitingCosts: row.netWaitingCosts
            ? Number(row.netWaitingCosts)
            : undefined,

        disbursementAmount: row.netDisbursementAmount
            ? Number(row.netDisbursementAmount)
            : undefined,

        disbursementVat: row.disbursementVatAmount
            ? Number(row.disbursementVatAmount)
            : undefined,

        vatApplicable: normaliseVat(row.vatIndicator),

    }));

    const result = await GenerateCrimeFiles(
        files,
        outcomes,
        format,
        {
            claims,
            office: options.office,
        }
    );

    return result;
}
