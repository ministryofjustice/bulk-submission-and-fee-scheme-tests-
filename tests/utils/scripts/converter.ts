import fs from 'fs';
import { create } from 'xmlbuilder2';

export async function convertFileToXml(inputFile: string, outputFile: string) {
    const content = fs.readFileSync(inputFile, 'utf-8');
    const lines = content.split('\n').map(line => line.trim()).filter(Boolean);

    const submission = create({ version: '1.0' })
        .ele('submission', {
            'xmlns': 'http://www.legalservices.gov.uk/sms/ActivityManagement/XMLSchema/',
            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            'xsi:schemaLocation':
                'http://www.legalservices.gov.uk/sms/ActivityManagement/XMLSchema/LSCSMSBulkLoadSchemaV3.xsd'
        });

    let currentOffice: any = null;
    let currentSchedule: any = null;

    for (const line of lines) {
        const [section, ...tokens] = line.split(',');
        const attrs: Record<string, string> = {};

        for (const token of tokens) {
            const [key, value] = token.split('=').map(s => s?.trim());
            if (key && value) attrs[key] = value;
        }

        switch (section.toUpperCase()) {
            case 'OFFICE':
                currentOffice = submission.ele('office', attrs);
                currentSchedule = null;
                break;

            case 'SCHEDULE':
                if (!currentOffice) throw new Error('Schedule found before Office');
                currentSchedule = currentOffice.ele('schedule', attrs);
                break;

            case 'OUTCOME':
                if (!currentSchedule) throw new Error('Outcome found before Schedule');

                // ✅ Handle matterType as an attribute
                const matterTypeValue = attrs['matterType'];
                delete attrs['matterType'];

                const outcome = currentSchedule.ele('outcome');
                if (matterTypeValue) outcome.att('matterType', matterTypeValue);

                for (const [key, value] of Object.entries(attrs)) {
                    outcome.ele('outcomeItem', { name: key }).txt(value);
                }
                break;

            case 'MATTERSTARTS':
                const starts = submission.ele('newMatterStarts');
                for (const [key, value] of Object.entries(attrs)) {
                    starts.ele('matterStart', { code: key }).txt(value);
                }
                break;

            case 'IMMIGRATIONCLR':
                const immClr = submission.ele('immigrationCLR');
                for (const [key, value] of Object.entries(attrs)) {
                    immClr.ele('immCLRData', { code: key }).txt(value);
                }
                break;

            default:
                throw new Error(`Unknown section: ${section}`);
        }
    }

    const xml = submission.end({ prettyPrint: true });
    fs.writeFileSync(outputFile, xml, 'utf-8');
    console.log(`✅ Converted ${inputFile} → ${outputFile}`);
}
