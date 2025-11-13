import path from "path";
import fs from "fs";
import { generateCSVFromFilename } from "./generateCSVFromFilename";
import { getUniqueSubmissionPeriod, generateScheduleRef } from "./submissionPeriodHelper";

interface MatterStartsResult {
  filePath: string;
  fileName: string;
  counts: Record<string, number>;
  submissionPeriod: string;
  scheduleRef: string;
  officeAccount: string;
}

interface AreaConfig {
  configKey: string;
  account: string;
  scheduleNum: string;
  dbAreaOfLaw: string;
}

const OUTPUT_DIR = path.resolve("tests/data/generated_csv");

const areaConfigMap: Record<string, AreaConfig> = {
  "legal help": {
    configKey: "0P322F_legal_help_matter_starts.csv",
    account: "0P322F",
    scheduleNum: "0P322F/CIVIL",
    dbAreaOfLaw: "LEGAL HELP",
  },
  mediation: {
    configKey: "0P322F_mediation_matter_starts.csv",
    account: "0P322F",
    scheduleNum: "0P322F/MEDI2024/01",
    dbAreaOfLaw: "MEDIATION",
  },
};

const areaMatterCodes: Record<string, string[]> = {
  "legal help": [
    "AAP",
    "COM",
    "CON",
    "DEB",
    "EDU",
    "EMP",
    "ELA",
    "HOU",
    "IMMAS",
    "IMMOT",
    "MAT",
    "MED",
    "MHE",
    "MSC",
    "PI",
    "PUB",
    "WB",
    "DISC",
  ],
  mediation: ["MDCS", "MDCC", "MDPS", "MDPC", "MDAS", "MDAC"],
};

const SHARED_KEYS = new Set(["SCHEDULE_REF", "PROCUREMENT_AREA", "ACCESS_POINT"]);

const extractCountsFromFile = (filePath: string): Record<string, number> => {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/);
  const counts: Record<string, number> = {};

  for (const line of lines) {
    if (!line.startsWith("MATTERSTARTS")) continue;

    const parts = line.split(",").slice(1);
    for (const part of parts) {
      const [rawKey, rawValue] = part.split("=");
      if (!rawKey || rawValue === undefined) continue;
      const key = rawKey.trim();
      if (SHARED_KEYS.has(key)) continue;

      const value = Number(rawValue.trim());
      if (!Number.isNaN(value)) {
        counts[key] = value;
      }
    }
  }

  return counts;
};

interface GenerateOptions {
  includeAllCodes?: boolean;
}

export async function generateMatterStartsFile(
  areaOfLaw: string,
  format: string,
  matterStartCode: string,
  count: number,
  options?: GenerateOptions
): Promise<MatterStartsResult> {
  const areaKey = areaOfLaw.trim().toLowerCase();
  const config = areaConfigMap[areaKey];

  if (!config) {
    throw new Error(
      `Matter starts generation is not supported for area of law: ${areaOfLaw}`
    );
  }

  const normalisedFormat = format.trim().toLowerCase();
  if (normalisedFormat !== "csv") {
    throw new Error(
      `Matter starts generation only supports csv format (got ${format})`
    );
  }

  const includeAllCodes = options?.includeAllCodes ?? false;
  const code = matterStartCode.trim().toUpperCase();
  const submissionPeriod = await getUniqueSubmissionPeriod(
    config.account,
    config.dbAreaOfLaw
  );
  const scheduleRef = generateScheduleRef(config.account);

  const codesForArea = areaMatterCodes[areaKey] ?? [code];
  if (!codesForArea && includeAllCodes) {
    throw new Error(`No matter start code list defined for area "${areaOfLaw}"`);
  }

  if (codesForArea && !includeAllCodes && !codesForArea.includes(code)) {
    throw new Error(`Matter start code ${code} is not valid for area "${areaOfLaw}"`);
  }

  const matterStartCounts = includeAllCodes
    ? Object.fromEntries(codesForArea.map((c, idx) => [c, idx + 1]))
    : { [code]: count };

  await generateCSVFromFilename(config.configKey, {
    matterStartCounts,
    account: config.account,
    submissionPeriod,
    scheduleNum: config.scheduleNum,
    scheduleRef,
    allowedMatterCodes: codesForArea ?? [code],
  });

  const sourcePath = path.join(OUTPUT_DIR, config.configKey);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Generated matter starts file not found at ${sourcePath}`);
  }

  const areaSlug = areaKey.replace(/\s+/g, "-");
  const codeSlug = includeAllCodes ? 'all-codes' : code.toLowerCase();
  const fileName = `${areaSlug}-matter-starts-${codeSlug}-${count}-${Date.now()}.csv`;
  const targetPath = path.join(OUTPUT_DIR, fileName);
  fs.copyFileSync(sourcePath, targetPath);

  const counts = extractCountsFromFile(targetPath);

  return {
    filePath: targetPath,
    fileName,
    counts,
    submissionPeriod,
    scheduleRef,
    officeAccount: config.account,
  };
}
