import * as fs from 'fs';
import * as path from 'path';

/**
 * Generates an empty file.
 * @param filePath Absolute path of the file to create.
 */
export async function generateEmptyFile(filePath: string): Promise<string> {
  ensureDirExists(path.dirname(filePath));
  fs.writeFileSync(filePath, '');
  await waitForFile(filePath);
  return filePath;
}

/**
 * Generates an invalid file with a random extension or the one provided.
 * @param filePath Absolute path of the file to create.
 */
export async function generateInvalidFile(filePath: string): Promise<string> {
  const extPool = ['.pdf', '.exe', '.jpg', '.png', '.docx'];
  const chosenExt = extPool[Math.floor(Math.random() * extPool.length)];

  const target = path.extname(filePath)
      ? filePath
      : filePath.replace(/\.[^/.]+$/, '') + chosenExt;

  ensureDirExists(path.dirname(target));
  fs.writeFileSync(target, 'This is not a valid file format for upload.');
  await waitForFile(target);
  return target;
}

/**
 * Generates a large file of the specified size (in MB).
 * @param filePath Absolute path of the file to create.
 * @param sizeInMB File size in megabytes.
 */
export async function generateLargeFile(filePath: string, sizeInMB: number): Promise<string> {
  ensureDirExists(path.dirname(filePath));
  const stream = fs.createWriteStream(filePath);
  const chunk = 'A'.repeat(1024 * 1024); // 1 MB
  let written = 0;

  return new Promise((resolve, reject) => {
    function writeChunk() {
      let ok = true;
      while (written < sizeInMB) {
        written++;
        if (written === sizeInMB) {
          stream.write(chunk, async () => {
            stream.end();
            try {
              await waitForFile(filePath);
              resolve(filePath);
            } catch (err) {
              reject(err);
            }
          });
          return;
        } else {
          ok = stream.write(chunk);
        }
        if (!ok) {
          stream.once('drain', writeChunk);
          return;
        }
      }
    }
    stream.on('error', reject);
    writeChunk();
  });
}

/**
 * Utility: Ensure directory exists.
 */
function ensureDirExists(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Utility: Wait until the file exists on disk.
 */
async function waitForFile(filePath: string, timeoutMs = 5000): Promise<void> {
  const start = Date.now();
  while (!fs.existsSync(filePath)) {
    if (Date.now() - start > timeoutMs) {
      throw new Error(`File ${filePath} not found after ${timeoutMs}ms`);
    }
    await new Promise((r) => setTimeout(r, 100));
  }
}
