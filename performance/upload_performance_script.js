import http from 'k6/http';
import { check, group, sleep } from 'k6';

const file = open('./test_data/legal_help_files/LegalHelp2Q271MFEB2025_NIL_No_NMS_CLR.csv', 'b');

const BASE_URL = 'http://localhost:8001';
const USERNAME = 'DT_SCRIPT_USER14';
const VENDOR_ID = 3969181;

export const options = {
    vus: 1,
    iterations: 1,
};

export default function () {
    let bulkFileId = null;

    group('1. Validate User', () => {
        const res = http.get(`${BASE_URL}/api/validate_user?username=${USERNAME}`);
        check(res, {
            'status is 200': (r) => r.status === 200,
        });
    });

    group('2. Upload File', () => {
        const payload = {
            file: http.file(file, 'LegalHelp.csv', 'text/csv'),
            username: USERNAME,
            vendor_id: VENDOR_ID,
        };

        const res = http.post(`${BASE_URL}/api/upload`, payload);

        check(res, {
            'upload succeeded': (r) => r.status === 201,
        });

        const json = res.json();
        bulkFileId = json?.am_bulk_file_id;
        check(bulkFileId, {
            'am_bulk_file_id exists': (id) => id !== undefined,
        });
    });

    group('3. Get Bulkload Summary', () => {
        const res = http.get(
            `${BASE_URL}/api/get_bulkload_summary?username=${USERNAME}&vendor_id=${VENDOR_ID}&am_bulk_file_id=${bulkFileId}`
        );
        check(res, {
            'got summary': (r) => r.status === 200,
        });
    });

    group('4. Get Bulkload Errors', () => {
        const res = http.get(
            `${BASE_URL}/api/get_bulkload_errors?username=${USERNAME}&vendor_id=${VENDOR_ID}&am_bulk_file_id=${bulkFileId}`
        );
        check(res, {
            'got errors (even if empty)': (r) => r.status === 200,
        });
    });

    group('5. Process Submission', () => {
        const res = http.post(
            `${BASE_URL}/api/process_submission?username=${USERNAME}&vendor_id=${VENDOR_ID}&am_bulk_file_id=${bulkFileId}`,
            null,
            { headers: { 'Content-Type': 'application/json' } }
        );
        check(res, {
            'submission processed': (r) => r.status === 201,
        });
    });

    sleep(1);
}