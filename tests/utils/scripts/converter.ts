import fs from 'fs';

type Attributes = Record<string, string>;

type Outcome = {
    matterType?: string;
    items: Array<{ name: string; value: string }>;
};

type Schedule = {
    attrs: Attributes;
    outcomes: Outcome[];
};

type Office = {
    attrs: Attributes;
    schedules: Schedule[];
};

type SubmissionModel = {
    offices: Office[];
    matterStarts: Array<Array<{ code: string; value: string }>>;
    immigrationClr: Array<Array<{ code: string; value: string }>>;
};

const escapeXml = (value: string): string =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

const attrsToString = (attrs: Attributes): string =>
    Object.entries(attrs)
        .map(([key, value]) => `${key}="${escapeXml(value)}"`)
        .join(' ');

const indent = (depth: number) => '  '.repeat(depth);

export async function convertFileToXml(inputFile: string, outputFile: string) {
    const content = fs.readFileSync(inputFile, 'utf-8');
    const lines = content.split('\n').map((line) => line.trim()).filter(Boolean);

    const model: SubmissionModel = {
        offices: [],
        matterStarts: [],
        immigrationClr: [],
    };

    let currentOffice: Office | undefined;
    let currentSchedule: Schedule | undefined;

    for (const rawLine of lines) {
        const [section, ...tokens] = rawLine.split(',');
        if (!section) continue;

        const attrs: Attributes = {};
        for (const token of tokens) {
            const [key, value] = token.split('=');
            if (key && value) attrs[key.trim()] = value.trim();
        }

        switch (section.toUpperCase()) {
            case 'OFFICE': {
                const office: Office = { attrs, schedules: [] };
                model.offices.push(office);
                currentOffice = office;
                currentSchedule = undefined;
                break;
            }

            case 'SCHEDULE': {
                if (!currentOffice) throw new Error('Schedule found before Office');
                const schedule: Schedule = { attrs, outcomes: [] };
                currentOffice.schedules.push(schedule);
                currentSchedule = schedule;
                break;
            }

            case 'OUTCOME': {
                if (!currentSchedule) throw new Error('Outcome found before Schedule');

                const outcomeAttrs = { ...attrs };
                const matterType = outcomeAttrs['matterType'];
                delete outcomeAttrs['matterType'];

                const items = Object.entries(outcomeAttrs).map(([name, value]) => ({
                    name,
                    value,
                }));

                currentSchedule.outcomes.push({ matterType, items });
                break;
            }

            case 'MATTERSTARTS': {
                const group = Object.entries(attrs).map(([code, value]) => ({ code, value }));
                if (group.length > 0) model.matterStarts.push(group);
                break;
            }

            case 'IMMIGRATIONCLR': {
                const group = Object.entries(attrs).map(([code, value]) => ({ code, value }));
                if (group.length > 0) model.immigrationClr.push(group);
                break;
            }

            default:
                throw new Error(`Unknown section: ${section}`);
        }
    }

    const linesOut: string[] = [];
    linesOut.push('<?xml version="1.0" encoding="UTF-8"?>');
    linesOut.push(
        '<submission xmlns="http://www.legalservices.gov.uk/sms/ActivityManagement/XMLSchema/" ' +
            'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
            'xsi:schemaLocation="http://www.legalservices.gov.uk/sms/ActivityManagement/XMLSchema/LSCSMSBulkLoadSchemaV3.xsd">'
    );

    for (const office of model.offices) {
        linesOut.push(`${indent(1)}<office ${attrsToString(office.attrs)}>`);

        for (const schedule of office.schedules) {
            linesOut.push(`${indent(2)}<schedule ${attrsToString(schedule.attrs)}>`);

            for (const outcome of schedule.outcomes) {
                const matterTypeAttr = outcome.matterType
                    ? ` matterType="${escapeXml(outcome.matterType)}"`
                    : '';
                linesOut.push(`${indent(3)}<outcome${matterTypeAttr}>`);

                for (const item of outcome.items) {
                    linesOut.push(
                        `${indent(4)}<outcomeItem name="${escapeXml(item.name)}">${escapeXml(item.value)}</outcomeItem>`
                    );
                }

                linesOut.push(`${indent(3)}</outcome>`);
            }

            linesOut.push(`${indent(2)}</schedule>`);
        }

        linesOut.push(`${indent(1)}</office>`);
    }

    for (const group of model.matterStarts) {
        linesOut.push(`${indent(1)}<newMatterStarts>`);
        for (const entry of group) {
            linesOut.push(
                `${indent(2)}<matterStart code="${escapeXml(entry.code)}">${escapeXml(entry.value)}</matterStart>`
            );
        }
        linesOut.push(`${indent(1)}</newMatterStarts>`);
    }

    for (const group of model.immigrationClr) {
        linesOut.push(`${indent(1)}<immigrationCLR>`);
        for (const entry of group) {
            linesOut.push(
                `${indent(2)}<immCLRData code="${escapeXml(entry.code)}">${escapeXml(entry.value)}</immCLRData>`
            );
        }
        linesOut.push(`${indent(1)}</immigrationCLR>`);
    }

    linesOut.push('</submission>');

    fs.writeFileSync(outputFile, `${linesOut.join('\n')}\n`, 'utf-8');
    console.log(`✅ Converted ${inputFile} → ${outputFile}`);
}
