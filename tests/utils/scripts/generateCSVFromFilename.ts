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

function loadConfig(env: string): Record<string, ConfigEntry> {
  const configPath = path.join(__dirname, `../config/${env}.json`);
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config not found: ${configPath}`);
  }
  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

export async function generateCSVFromFilename(fileName: string): Promise<void> {
  const config = loadConfig(ENV);
  const entry = config[fileName];

  if (!entry) {
    throw new Error(`File name not found in config for ${fileName}`);
  }

  const { account, period, scheduleNum, scheduleRef, template } = entry;

  const templatePath = path.resolve(__dirname, "../../data/templates/", template);
  const outputPath = path.resolve(__dirname, "../../data/generated_csv/", fileName);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template missing: ${templatePath}`);
  }

  const lines = fs.readFileSync(templatePath, "utf8").split(/\r?\n/);

  const updatedLines = lines.map((line) => {
    if (line.startsWith("OFFICE,")) {
      return line.replace(/account=\w+/, `account=${account}`);
    }
    if (line.startsWith("SCHEDULE,")) {
      return line
        .replace(/submissionPeriod=\w+-\d+/, `submissionPeriod=${period}`)
        .replace(/scheduleNum=[^,]+/, `scheduleNum=${scheduleNum}`);
    }
    if (scheduleRef && line.includes("SCHEDULE_REF=")) {
      return line.replace(/SCHEDULE_REF=[\d\/\w]+/, `SCHEDULE_REF=${scheduleRef}`);
    }
    return line;
  });

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
