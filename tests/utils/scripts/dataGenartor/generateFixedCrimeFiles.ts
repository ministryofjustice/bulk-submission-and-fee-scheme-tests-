import fs from "fs";
import path from "path";
import { getUniqueSubmissionPeriod } from "./submissionPeriodHelper";

const OUTPUT_DIR = "generated_fixed_crime_police";

export async function GenerateFixedCrimePoliceFile(
    filename: string = "crime_fixed"
): Promise<{ filePath: string; office: string; submissionPeriod: string }> {

    const office = "0P322F";

    // ✅ Get a UNIQUE valid period (no existing submission)
    const {
        period: submissionPeriod
    } = await getUniqueSubmissionPeriod(office, "CRIME LOWER");

    let content = "";
    let year = submissionPeriod.split("-")[1];

    // --- OFFICE ---
    content += `OFFICE,account=${office}\n`;

    // --- SCHEDULE (Only the period changes) ---
    content += `SCHEDULE,submissionPeriod=${submissionPeriod},areaOfLaw=CRIME LOWER,scheduleNum=${office}/CRM\n`;

    // --- OUTCOME 1 (STATIC) ---
    content +=
        `OUTCOME,FEE_CODE=INVC,matterType=INVC,UFN=271219/000,CLIENT_FORENAME=Kraig,CLIENT_SURNAME=Will,GENDER=M,ETHNICITY=03,DISABILITY=SEN,CASE_START_DATE=27/12/2019,` +
        `PROFIT_COST=140.4,DISBURSEMENTS_AMOUNT=50,DISBURSEMENTS_VAT=1.79,VAT_INDICATOR=Y,TRAVEL_COSTS=75.38,OUTCOME_CODE=CN02,CRIME_MATTER_TYPE=02,` +
        `TRAVEL_WAITING_COSTS=10,WORK_CONCLUDED_DATE=15/01/${year},NO_OF_SUSPECTS=2,NO_OF_POLICE_STATION=1,POLICE_STATION=RD016,DUTY_SOLICITOR=Y,` +
        `YOUTH_COURT=N,SCHEME_ID=1134,DSCC_NUMBER=291017601B\n`;

    // --- OUTCOME 2 (STATIC) ---
    content +=
        `OUTCOME,FEE_CODE=INVC,matterType=INVC,UFN=010917/001,CLIENT_FORENAME=Dan,CLIENT_SURNAME=Dach,GENDER=F,ETHNICITY=02,DISABILITY=LDD,CASE_START_DATE=01/09/2017,` +
        `PROFIT_COST=56.43,DISBURSEMENTS_AMOUNT=5000,DISBURSEMENTS_VAT=0.73,VAT_INDICATOR=Y,TRAVEL_COSTS=500,OUTCOME_CODE=CN02,CRIME_MATTER_TYPE=01,` +
        `TRAVEL_WAITING_COSTS=500,WORK_CONCLUDED_DATE=20/01/${year},NO_OF_SUSPECTS=3,NO_OF_POLICE_STATION=1,POLICE_STATION=NE001,DUTY_SOLICITOR=Y,` +
        `YOUTH_COURT=Y,SCHEME_ID=1001,DSCC_NUMBER=255992044D\n`;

    // --- Write file ---
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

    const filePath = path.join(OUTPUT_DIR, `${filename}.txt`);
    fs.writeFileSync(filePath, content, "utf-8");

    console.log(`🎉 Fixed Crime Lower file ready using period ${submissionPeriod}`);

    return { filePath, office, submissionPeriod };
}
