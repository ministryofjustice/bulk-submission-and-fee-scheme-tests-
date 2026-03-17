import {When} from '@cucumber/cucumber';
import type {CustomWorld} from '../support/world';
import {SubmissionSummaryPage} from '../../pages/SubmissionSummaryPage';
import {createDataSourceManager} from '../../utils/db/dataSourceManager';
import {randomUUID} from 'crypto';

const resolveClaimIdFromDatabase = async (submissionId: string): Promise<string | undefined> => {
  const manager = createDataSourceManager({label: 'void-claim-step'});
  const ready = await manager.ensureInitialized();
  if (!ready) return undefined;

  try {
    const db = manager.getDataSource();
    const rows = await db.query(
      `SELECT id FROM claims.claim WHERE submission_id = $1 ORDER BY id ASC LIMIT 1`,
      [submissionId]
    );
    return rows?.[0]?.id;
  } finally {
    await manager.destroy();
  }
};

When(
  'I void claim {int} via the void endpoint',
  async function (this: CustomWorld, claimNumber: number) {
    if (!this.submissionSummaryPage) {
      this.submissionSummaryPage = new SubmissionSummaryPage(this.page!);
    }

    const dstewbaseUrl = process.env.DSTEW_API_BASE_URL;
    const dstewToken = process.env.DSTEW_API_TOKEN;

    if (!dstewbaseUrl || !dstewToken) {
      throw new Error('DSTEW_API_BASE_URL or DSTEW_API_TOKEN is missing.');
    }

    const index = Math.max(claimNumber - 1, 0);

    let claimId: string | undefined;
    try {
      claimId = await this.submissionSummaryPage.getClaimIdByIndex(index);
      await this.attach(`🧾 Claim ID from UI row ${claimNumber}: ${claimId}`, 'text/plain');
    } catch (err) {
      await this.attach(
        `⚠️ Could not resolve claim ID from UI: ${err instanceof Error ? err.message : String(err)}`,
        'text/plain'
      );
    }

    if (!claimId && this.mostRecentSubmissionId) {
      claimId = await resolveClaimIdFromDatabase(this.mostRecentSubmissionId);
      if (claimId) {
        await this.attach(`🧾 Claim ID from DB fallback: ${claimId}`, 'text/plain');
      }
    }

    if (!claimId) {
      throw new Error('Unable to resolve claim ID for void operation.');
    }

    const voidEndpoint = `${dstewbaseUrl}/api/v1/claims/${claimId}/void`;
    const payload = {
      created_by_user_id: randomUUID(),
      assessment_reason: 'String',
    };

    const resp = await this.client.post(voidEndpoint, payload, {
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: dstewToken,
      },
    });

    if (!(resp.status >= 200 && resp.status < 300)) {
      throw new Error(`Failed to void claim ${claimId}. POST ${voidEndpoint} (${resp.status}).`);
    }

    await this.attach(
      `✅ Claim voided via POST ${voidEndpoint} (${resp.status}) with created_by_user_id=${payload.created_by_user_id}`,
      'text/plain'
    );

    await this.page!.reload({waitUntil: 'domcontentloaded'});
  }
);
