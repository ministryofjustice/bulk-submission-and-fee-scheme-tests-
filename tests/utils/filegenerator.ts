import * as fs from 'fs';
import * as path from 'path';

// Generate large file of given size (in MB)
export function generateLargeFile(fileName: string, sizeInMB: number): Promise<void> {
     process.env.FILENAME = fileName;
  const filePath = path.join(__dirname, '..', 'data', fileName);
  const stream = fs.createWriteStream(filePath);

  return new Promise<void>((resolve, reject) => {
    const chunk = 'A'.repeat(1024 * 1024); // 1MB chunk
    let written = 0;

    function write() {
      let ok = true;
      while (written < sizeInMB) {
        written++;
        if (written === sizeInMB) {
          stream.write(chunk, () => {
            stream.end();
            resolve();
          });
          return;
        } else {
          ok = stream.write(chunk);
        }
        if (!ok) {
          stream.once('drain', write);
          return;
        }
      }
    }

    write();
  });
}

// Generate invalid file with random extension
export function generateInvalidFile(baseName: string): string {
  const invalidExtensions = ['.pdf', '.exe', '.jpg', '.png', '.docx'];
  const randomExt = invalidExtensions[Math.floor(Math.random() * invalidExtensions.length)];

  const fileName = `${baseName}${randomExt}`;
  process.env.FILENAME = fileName;
  const filePath = path.join(__dirname, '..', 'data', fileName);

  fs.writeFileSync(filePath, 'This is not a valid file format for upload.');

  return filePath;
}

export function generateEmptyFile(fileName: string): string {
  const filePath = path.join(__dirname, '..', 'data', fileName);
  fs.writeFileSync(filePath, ''); // empty content
  return filePath; // return path for test usage
}
