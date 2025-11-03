// import 'reflect-metadata';
// import { DataSource } from 'typeorm';
// import dotenv from 'dotenv';
//
// dotenv.config();
//
// // ---------- 1️⃣ Configure the Data Source ----------
// const AppDataSource = new DataSource({
//     type: 'postgres',
//     host: process.env.DB_HOST,
//     port: Number(process.env.DB_PORT || 5432),
//     username: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME,
//     ssl: { rejectUnauthorized: false },
//     synchronize: false,
// });
//
// // ---------- 2️⃣ Cleanup Function ----------
// export async function cleanSubmissionData(
//     dataSource: DataSource,
//     submissionIds: string[]
// ): Promise<void> {
//     if (submissionIds.length === 0) {
//         console.log('⚠️ No submissions to clean.');
//         return;
//     }
//
//     const submissionIdList = submissionIds.join(', ');
//     console.log(`🚀 Beginning cleanup for submission IDs: ${submissionIdList}`);
//
//     await dataSource.transaction(async (entityManager) => {
//         const runDelete = async (label: string, query: string) => {
//             const result = await entityManager.query(query, [submissionIds]);
//             const count = Array.isArray(result) ? result.length : 0;
//             console.log(`✅ Deleted from ${label} (${count} rows, if any)`);
//         };
//
//         await runDelete(
//             'claims.calculated_fee_detail',
//             `
//             DELETE FROM claims.calculated_fee_detail
//             WHERE claim_id IN (
//                 SELECT id FROM claims.claim WHERE submission_id = ANY($1)
//             )
//         `
//         );
//
//         await runDelete(
//             'claims.validation_message_log',
//             `
//             DELETE FROM claims.validation_message_log
//             WHERE submission_id = ANY($1)
//                OR claim_id IN (
//                     SELECT id FROM claims.claim WHERE submission_id = ANY($1)
//                 )
//         `
//         );
//
//         await runDelete(
//             'claims.claim_summary_fee',
//             `
//             DELETE FROM claims.claim_summary_fee
//             WHERE claim_id IN (
//                 SELECT id FROM claims.claim WHERE submission_id = ANY($1)
//             )
//         `
//         );
//
//         await runDelete(
//             'claims.claim_case',
//             `
//             DELETE FROM claims.claim_case
//             WHERE claim_id IN (
//                 SELECT id FROM claims.claim WHERE submission_id = ANY($1)
//             )
//         `
//         );
//
//         await runDelete(
//             'claims.client',
//             `
//             DELETE FROM claims.client
//             WHERE claim_id IN (
//                 SELECT id FROM claims.claim WHERE submission_id = ANY($1)
//             )
//         `
//         );
//
//         await runDelete(
//             'claims.matter_start',
//             `
//             DELETE FROM claims.matter_start
//             WHERE submission_id = ANY($1)
//         `
//         );
//
//         await runDelete(
//             'claims.claim',
//             `
//             DELETE FROM claims.claim
//             WHERE submission_id = ANY($1)
//         `
//         );
//
//         await runDelete(
//             'claims.submission',
//             `
//             DELETE FROM claims.submission
//             WHERE id = ANY($1)
//         `
//         );
//
//         await runDelete(
//             'claims.bulk_submission',
//             `
//             DELETE FROM claims.bulk_submission
//             WHERE id IN (
//                 SELECT DISTINCT bulk_submission_id
//                 FROM claims.submission
//                 WHERE id = ANY($1)
//             )
//         `
//         );
//     });
//
//     console.log(`🎉 Cleanup completed successfully for submission IDs: ${submissionIdList}`);
// }
//
// // ---------- 3️⃣ Get Submissions for Test User ----------
// async function getTodaysSubmissionIdsForUser(
//     dataSource: DataSource,
//     providerUser: string
// ): Promise<string[]> {
//     const today = new Date().toISOString().split('T')[0]; // e.g. '2025-10-27'
//
//     const query = `
//         SELECT id
//         FROM claims.submission
//         WHERE provider_user_id = $1
//           AND created_on::date = $2::date
//     `;
//
//     const results = await dataSource.query(query, [providerUser, today]);
//     return results.map((r: any) => r.id);
// }
//
// // ---------- 4️⃣ Execute Automatically ----------
// (async () => {
//     const providerUser = 'Test.User-submit-a-bulk-claim-auto-test@devl.justice.gov.uk';
//
//     try {
//         await AppDataSource.initialize();
//         console.log('✅ Database connection established');
//
//         const submissionIdsToDelete = await getTodaysSubmissionIdsForUser(AppDataSource, providerUser);
//
//         if (submissionIdsToDelete.length === 0) {
//             console.log(`⚠️ No submissions found for ${providerUser} today.`);
//         } else {
//             console.log(`🧾 Found ${submissionIdsToDelete.length} submission(s) for ${providerUser}.`);
//             await cleanSubmissionData(AppDataSource, submissionIdsToDelete);
//         }
//     } catch (error) {
//         console.error('❌ Cleanup failed:', error);
//     } finally {
//         if (AppDataSource.isInitialized) {
//             await AppDataSource.destroy();
//             console.log('🔒 Database connection closed');
//         }
//     }
// })();

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
        const runDelete = async (label: string, query: string) => {
            const result = await entityManager.query(query, [submissionIds]);
            const count = Array.isArray(result) ? result.length : 0;
            console.log(`✅ Deleted from ${label} (${count} rows, if any)`);
        };

        await runDelete(
            'claims.calculated_fee_detail',
            `
      DELETE FROM claims.calculated_fee_detail 
      WHERE claim_id IN (
          SELECT id FROM claims.claim WHERE submission_id = ANY($1)
      )
    `
        );

        await runDelete(
            'claims.validation_message_log',
            `
      DELETE FROM claims.validation_message_log
      WHERE submission_id = ANY($1)
         OR claim_id IN (
              SELECT id FROM claims.claim WHERE submission_id = ANY($1)
          )
    `
        );

        await runDelete(
            'claims.claim_summary_fee',
            `
      DELETE FROM claims.claim_summary_fee
      WHERE claim_id IN (
          SELECT id FROM claims.claim WHERE submission_id = ANY($1)
      )
    `
        );

        await runDelete(
            'claims.claim_case',
            `
      DELETE FROM claims.claim_case
      WHERE claim_id IN (
          SELECT id FROM claims.claim WHERE submission_id = ANY($1)
      )
    `
        );

        await runDelete(
            'claims.client',
            `
      DELETE FROM claims.client
      WHERE claim_id IN (
          SELECT id FROM claims.claim WHERE submission_id = ANY($1)
      )
    `
        );

        await runDelete(
            'claims.matter_start',
            `
      DELETE FROM claims.matter_start
      WHERE submission_id = ANY($1)
    `
        );

        await runDelete(
            'claims.claim',
            `
      DELETE FROM claims.claim
      WHERE submission_id = ANY($1)
    `
        );

        await runDelete(
            'claims.submission',
            `
      DELETE FROM claims.submission
      WHERE id = ANY($1)
    `
        );

        await runDelete(
            'claims.bulk_submission',
            `
      DELETE FROM claims.bulk_submission
      WHERE id IN (
          SELECT DISTINCT bulk_submission_id
          FROM claims.submission
          WHERE id = ANY($1)
      )
    `
        );
    });

    console.log(`🎉 Cleanup completed successfully for submission IDs: ${submissionIdList}`);
}

// ---------- 3️⃣ Get Submissions from the Past 4 Days ----------
async function getRecentSubmissionIdsForUser(
    dataSource: DataSource,
    providerUser: string
): Promise<string[]> {
    const query = `
      SELECT id 
      FROM claims.submission
      WHERE provider_user_id = $1
        AND created_on >= (CURRENT_DATE - INTERVAL '4 days')
  `;

    const results = await dataSource.query(query, [providerUser]);
    return results.map((r: any) => r.id);
}

// ---------- 4️⃣ Execute Automatically ----------
(async () => {
    const providerUser = 'Test.User-submit-a-bulk-claim-auto-test@devl.justice.gov.uk';

    try {
        await AppDataSource.initialize();
        console.log('✅ Database connection established');

        const submissionIdsToDelete = await getRecentSubmissionIdsForUser(AppDataSource, providerUser);

        if (submissionIdsToDelete.length === 0) {
            console.log(`⚠️ No submissions found for ${providerUser} in the past 4 days.`);
        } else {
            console.log(`🧾 Found ${submissionIdsToDelete.length} submission(s) for ${providerUser} in the past 4 days.`);
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
