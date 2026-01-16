import fs from 'fs';
import { claimOptions } from '../claimOptions';

export function applyImmigrationBoltOns(
    filePath: string,
    claims: claimOptions[]
) {
    let lines = fs.readFileSync(filePath, 'utf8').split('\n');
    let index = 0;

    lines = lines.map(line => {
        if (!line.startsWith('OUTCOME')) return line;

        const o = claims[index++];
        if (!o) return line;

        if (o.hoInterview)
            line += `,HO_INTERVIEW=${o.hoInterview}`;

        if (o.adjournedHearing)
            line += `,ADJOURNED_HEARING_FEE=${o.adjournedHearing}`;

        if (o.jrFormFilling !== undefined)
            line += `,JR_FORM_FILLING=${o.jrFormFilling}`;

        if (o.cmrhOral !== undefined)
            line += `,CMRH_ORAL=${o.cmrhOral}`;

        if (o.cmrhTelephone !== undefined)
            line += `,CMRH_TELEPHONE=${o.cmrhTelephone}`;

        if (o.substantiveHearing)
            line += `,SUBSTANTIVE_HEARING=${o.substantiveHearing}`;

        if (o.detentionTravelWaitingCosts !== undefined)
            line += `,DETENTION_TRAVEL_WAITING_COSTS=${o.detentionTravelWaitingCosts}`;

        return line;
    });

    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
}
