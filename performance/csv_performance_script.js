import http from 'k6/http';
import {check, sleep} from 'k6';
import {SharedArray} from 'k6/data';

export const options = {
    stages: [
        { duration: '30s', target: 5 },   // light load
        { duration: '1m', target: 10 },   // moderate
        { duration: '1m', target: 15 },   // ramping up
        { duration: '1m', target: 20 },   // reach 20 users (one per file)
        { duration: '3m', target: 20 },   // hold peak
        { duration: '1m', target: 0 },    // ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<6000'],
        http_req_failed: ['rate<0.01']
    }
};

const fileList = JSON.parse(open('./fileList.json'));

const testFiles = new SharedArray('testFiles', () =>
    fileList.map(file => ({
        name: file.name,
        type: file.type,
        expectedStatus: file.expectedStatus,
        content: open(file.path),
    }))
);

export default function () {
    const file = testFiles[__ITER % testFiles.length];

    const payload = {
        file: http.file(file.content, file.name, file.type),
    };

    const res = http.post('http://localhost:8002/api/convert-csv', payload);

    const success = check(res, {
        [`status is ${file.expectedStatus} for ${file.name}`]: r => r.status === file.expectedStatus,
        'response is not empty': r => r.body && r.body.length > 0,
    });

    if (!success) {
        console.error(`❌ Failed: ${file.name} | Got ${res.status} | Body: ${res.body}`);
    }

    sleep(Math.random() * 3 + 1.5);
}
