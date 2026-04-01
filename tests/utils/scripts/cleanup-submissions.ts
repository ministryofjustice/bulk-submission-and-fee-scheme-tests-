import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

// ---------- 1️⃣ Configure the Data Source ----------
const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    synchronize: false,
});

// ---------- 2️⃣ Cleanup Function ----------
export async function cleanSubmissionData(
    dataSource: DataSource,
    submissionIds: string[]
): Promise<void> {
    if (submissionIds.length === 0) {
        console.log('⚠️ No submissions to clean.');
        return;
    }

    const submissionIdList = submissionIds.join(', ');
    console.log(`🚀 Beginning cleanup for submission IDs: ${submissionIdList}`);

    await dataSource.transaction(async (entityManager) => {
        const bulkSubmissionRows = await entityManager.query(
            `
            SELECT DISTINCT bulk_submission_id
            FROM claims.submission
            WHERE id = ANY($1)
              AND bulk_submission_id IS NOT NULL
            `,
            [submissionIds]
        );

        const bulkSubmissionIds = bulkSubmissionRows.map((row: any) => row.bulk_submission_id);

        const runDelete = async (label: string, query: string, params: any[]) => {
            await entityManager.query(query, params);
            console.log(`✅ Deleted from ${label}`);
        };

        await runDelete(
            'claims.calculated_fee_detail',
            `
                DELETE FROM claims.calculated_fee_detail
                WHERE claim_id IN (
                    SELECT id FROM claims.claim WHERE submission_id = ANY($1)
                )
            `,
            [submissionIds]
        );

        await runDelete(
            'claims.validation_message_log',
            `
                DELETE FROM claims.validation_message_log
                WHERE submission_id = ANY($1)
                   OR claim_id IN (
                    SELECT id FROM claims.claim WHERE submission_id = ANY($1)
                )
            `,
            [submissionIds]
        );

        await runDelete(
            'claims.assessment',
            `
                DELETE FROM claims.assessment
                WHERE claim_summary_fee_id IN (
                    SELECT id FROM claims.claim_summary_fee
                    WHERE claim_id IN (
                        SELECT id FROM claims.claim WHERE submission_id = ANY($1)
                    )
                )
            `,
            [submissionIds]
        );

        await runDelete(
            'claims.claim_summary_fee',
            `
                DELETE FROM claims.claim_summary_fee
                WHERE claim_id IN (
                    SELECT id FROM claims.claim WHERE submission_id = ANY($1)
                )
            `,
            [submissionIds]
        );

        await runDelete(
            'claims.claim_case',
            `
                DELETE FROM claims.claim_case
                WHERE claim_id IN (
                    SELECT id FROM claims.claim WHERE submission_id = ANY($1)
                )
            `,
            [submissionIds]
        );

        await runDelete(
            'claims.client',
            `
                DELETE FROM claims.client
                WHERE claim_id IN (
                    SELECT id FROM claims.claim WHERE submission_id = ANY($1)
                )
            `,
            [submissionIds]
        );

        await runDelete(
            'claims.matter_start',
            `
                DELETE FROM claims.matter_start
                WHERE submission_id = ANY($1)
            `,
            [submissionIds]
        );

        await runDelete(
            'claims.claim',
            `
                DELETE FROM claims.claim
                WHERE submission_id = ANY($1)
            `,
            [submissionIds]
        );

        await runDelete(
            'claims.submission',
            `
                DELETE FROM claims.submission
                WHERE id = ANY($1)
            `,
            [submissionIds]
        );

        if (bulkSubmissionIds.length > 0) {
            await runDelete(
                'claims.bulk_submission',
                `
                DELETE FROM claims.bulk_submission
                WHERE id = ANY($1)
                `,
                [bulkSubmissionIds]
            );
        }
    });

    console.log(`🎉 Cleanup completed successfully for submission IDs: ${submissionIdList}`);
}
// ---------- 3️⃣ Get Submissions from the Past 30 Days ----------
async function getRecentSubmissionIds(
    dataSource: DataSource
): Promise<string[]> {
    const query = `
        SELECT id
        FROM claims.submission
        WHERE created_on >= (CURRENT_DATE - INTERVAL '30 days')
    `;

    const results = await dataSource.query(query);
    return results.map((r: any) => r.id);
}

// ---------- 4️⃣ Execute Automatically ----------
if (require.main === module) {
    (async () => {
        const providerUser = process.env.USERNAME;

        try {
            await AppDataSource.initialize();
            console.log('✅ Database connection established');

            const submissionIdsToDelete = await getRecentSubmissionIds(AppDataSource);

            if (submissionIdsToDelete.length === 0) {
                console.log(`⚠️ No submissions found in the past 30 days.`);
            } else {
                console.log(`🧾 Found ${submissionIdsToDelete.length} submission(s) in the past 80 days.`);
                await cleanSubmissionData(AppDataSource, submissionIdsToDelete);
            }
        } catch (error) {
            console.error('❌ Cleanup failed:', error);
        } finally {
            if (AppDataSource.isInitialized) {
                await AppDataSource.destroy();
                console.log('🔒 Database connection closed');
            }
        }
    })();
}
