const fs = require('fs');
const path = require('path');

const folderPath = './test_data';
const allExtensions = ['.csv', '.txt', '.xml', '.docx', '.pdf', '.json', '.png'];

function getMimeType(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    switch (ext) {
        case '.csv':
        case '.txt':
            return 'text/csv';
        case '.xml':
            return 'text/xml';
        case '.json':
            return 'application/json';
        case '.pdf':
            return 'application/pdf';
        case '.docx':
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        case '.png':
            return 'image/png';
        default:
            return 'application/octet-stream';
    }
}

function getExpectedStatus(fileName, ext) {
    const lowerName = fileName.toLowerCase();
    if (['.docx', '.pdf', '.json', '.png'].includes(ext)) return 400;
    if (lowerName.includes('empty')) return 406;
    return 200;
}

function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, arrayOfFiles);
        } else {
            const ext = path.extname(file).toLowerCase();
            if (allExtensions.includes(ext)) {
                arrayOfFiles.push({
                    name: path.basename(file),
                    path: fullPath,
                    type: getMimeType(file),
                    expectedStatus: getExpectedStatus(file, ext),
                });
            }
        }
    });

    return arrayOfFiles;
}

const fileObjects = getAllFiles(folderPath);

fs.writeFileSync('./fileList.json', JSON.stringify(fileObjects, null, 2));
console.log(`✅ Found ${fileObjects.length} file(s) including subdirectories.`);
