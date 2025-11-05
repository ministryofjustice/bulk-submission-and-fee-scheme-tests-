import fs from "fs";
import path from "path";

const ENV = process.env.TEST_ENV || "test";

type ConfigEntry = {
  account: string;
  period: string;
  scheduleNum: string;
  scheduleRef?: string;
  template: string;
};

type GenerateOptions = {
  matterStartCounts?: Record<string, number>;
  account?: string;
  submissionPeriod?: string;
  scheduleNum?: string;
  scheduleRef?: string;
  allowedMatterCodes?: string[];
};

const MATTER_START_CODES = [
  "AAP",  // Actions Against the Police etc.
  "COM",  // Community Care
  "CON",  // Consumer/General Contract
  "DEB",  // Debt
  "EDU",  // Education
  "EMP",  // Employment
  "ELA",  // Early Legal Advice
  "HOU",  // Housing
  "IMMAS", // Immigration - Asylum
  "IMMOT", // Immigration Other Than Asylum
  "MAT",  // Family
  "MED",  // Clinical Negligence
  "MHE",  // Mental Health
  "MSC",  // Residual (Miscellaneous)
  "PI",   // Personal Injury
  "PUB",  // Public Law
  "WB",   // Welfare Benefits
  "DISC", // Discrimination
  "MDCS",
  "MDCC",
  "MDPS",
  "MDPC",
  "MDAS",
  "MDAC",
] as const;

function loadConfig(env: string): Record<string, ConfigEntry> {
  const configPath = path.join(__dirname, `../config/${env}.json`);
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config not found: ${configPath}`);
  }
  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

function autoGenerateMatterStartLines(
  line: string,
  scheduleRefOverride?: string,
  countOverrides?: Record<string, number>,
  allowedCodes?: string[]
): string[] {
  const tokens = line.split(",").map((token) => token.trim()).filter(Boolean);
  if (tokens.length === 0 || tokens[0] !== "MATTERSTARTS") {
    return [line];
  }

  const [, ...pairs] = tokens;
  const attrs: Record<string, string> = {};

  for (const pair of pairs) {
    const [rawKey, ...rawValueParts] = pair.split("=");
    const key = rawKey?.trim();
    const value = rawValueParts.join("=").trim();
    if (key) attrs[key] = value;
  }

  if (scheduleRefOverride) {
    attrs["SCHEDULE_REF"] = scheduleRefOverride;
  }

  const sharedKeys = ["SCHEDULE_REF", "PROCUREMENT_AREA", "ACCESS_POINT"];
  const sharedTokens = sharedKeys
    .filter((key) => attrs[key])
    .map((key) => `${key}=${attrs[key]}`);

  const baseCodes = Object.keys(attrs).filter(
    (key) => !sharedKeys.includes(key)
  );

  const overridesOnly: Record<string, number> = {};
  if (countOverrides) {
    for (const [code, count] of Object.entries(countOverrides)) {
      if (baseCodes.includes(code)) {
        attrs[code] = `${count}`;
      } else {
        overridesOnly[code] = count;
      }
    }
  }

  const generatedLines: string[] = [];

  if (baseCodes.length > 0) {
    const existingTokens = baseCodes.map(
      (code) => `${code}=${attrs[code]}`
    );
    generatedLines.push(
      ["MATTERSTARTS", ...sharedTokens, ...existingTokens].join(",")
    );
  } else if (sharedTokens.length > 0) {
    generatedLines.push(["MATTERSTARTS", ...sharedTokens].join(","));
  } else {
    generatedLines.push("MATTERSTARTS");
  }

  for (const [code, count] of Object.entries(overridesOnly)) {
    const codeTokens = [...sharedTokens, `${code}=${count}`];
    generatedLines.push(["MATTERSTARTS", ...codeTokens].join(","));
  }

  const fallbackCodes = allowedCodes ?? MATTER_START_CODES;

  let counter = 1;
  for (const code of fallbackCodes) {
    if (baseCodes.includes(code) || overridesOnly[code] !== undefined) continue;
    const overrideValue = countOverrides?.[code];
    const value = overrideValue !== undefined ? overrideValue : counter;
    const codeTokens = [...sharedTokens, `${code}=${value}`];
    generatedLines.push(["MATTERSTARTS", ...codeTokens].join(","));
    counter++;
  }

  return generatedLines;
}

export async function generateCSVFromFilename(
  fileName: string,
  options?: GenerateOptions
): Promise<void> {
  const config = loadConfig(ENV);
  const entry = config[fileName];

  if (!entry) {
    throw new Error(`File name not found in config for ${fileName}`);
  }

  const { account, period, scheduleNum, scheduleRef, template } = entry;
  const accountValue = options?.account ?? account;
  const periodValue = options?.submissionPeriod ?? period;
  const scheduleNumValue = options?.scheduleNum ?? scheduleNum;
  const scheduleRefValue = options?.scheduleRef ?? scheduleRef;

  const templatePath = path.resolve(
    __dirname,
    "../../data/templates/",
    template
  );
  const outputPath = path.resolve(
    __dirname,
    "../../data/generated_csv/",
    fileName
  );

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template missing: ${templatePath}`);
  }

  const lines = fs.readFileSync(templatePath, "utf8").split(/\r?\n/);

  const updatedLines: string[] = [];

  for (const line of lines) {
    if (line.trim().length === 0) {
      updatedLines.push(line);
      continue;
    }

    if (line.startsWith("MATTERSTARTS")) {
      const generated = autoGenerateMatterStartLines(
        line,
        scheduleRefValue,
        options?.matterStartCounts,
        options?.allowedMatterCodes
      );
      updatedLines.push(...generated);
      continue;
    }

    let updatedLine = line;
    if (line.startsWith("OFFICE,")) {
      updatedLine = line.replace(/account=[^,]+/, `account=${accountValue}`);
    } else if (line.startsWith("SCHEDULE,")) {
      updatedLine = line
        .replace(/submissionPeriod=\w+-\d+/, `submissionPeriod=${periodValue}`)
        .replace(/scheduleNum=[^,]+/, `scheduleNum=${scheduleNumValue}`);
    } else if (scheduleRefValue && line.includes("SCHEDULE_REF=")) {
      updatedLine = line.replace(
        /SCHEDULE_REF=[\d\/\w]+/,
        `SCHEDULE_REF=${scheduleRefValue}`
      );
    }

    updatedLines.push(updatedLine);
  }

  const content = updatedLines.join("\n");
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, content, "utf8");
  console.log(`Generated ${fileName} from template ${template}`);
}

//
// // 👇 Add this at the end of your file
// if (require.main === module) {
//   const fileName = process.argv[2];
//
//   if (!fileName) {
//     console.error("❌ Please provide a file name argument. Example:");
//     console.error("   npx ts-node src/scripts/generateCSV.ts myfile.csv");
//     process.exit(1);
//   }
//
//   generateCSVFromFilename(fileName)
//       .then(() => console.log(`✅ CSV generated successfully for ${fileName}`))
//       .catch((err) => {
//         console.error("❌ Error generating CSV:", err);
//         process.exit(1);
//       });
// }
