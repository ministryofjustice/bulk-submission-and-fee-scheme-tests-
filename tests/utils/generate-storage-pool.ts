import { chromium } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { authenticator } from 'otplib';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const STORAGE_DIR = path.resolve('tests/auth-states');
const COUNT = parseInt(process.env.STATE_COUNT || '3', 10);
const MFA_SECRET = process.env.MFA_SECRET;

if (!MFA_SECRET) {
    console.error('❌ Missing MFA_SECRET in .env');
    process.exit(1);
}

// 🕒 Helper to wait until next 30-second OTP window
async function waitForNextOtpWindow() {
    const now = Math.floor(Date.now() / 1000);
    const secondsToNextWindow = 30 - (now % 30);
    console.log(`⏳ Waiting ${secondsToNextWindow}s for next OTP window...`);
    return new Promise(resolve => setTimeout(resolve, secondsToNextWindow * 1000));
}

(async () => {
    if (!fs.existsSync(STORAGE_DIR)) {
        fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }

    console.log(`🔐 Generating ${COUNT} fresh storage states...`);

    for (let i = 1; i <= COUNT; i++) {
        if (i > 1) await waitForNextOtpWindow(); // ensures each session gets a fresh OTP

        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        const loginPage = new LoginPage(page);

        console.log(`➡️ Logging in (session ${i})...`);
        await loginPage.navigateTo();

        // Generate new OTP for this cycle
        // @ts-ignore
        const otpCode = authenticator.generate(MFA_SECRET, { encoding: 'base32' });
        console.log(`🔢 OTP for session ${i}: ${otpCode}`);

        // Pass OTP to login method
        // @ts-ignore
        await loginPage.login(otpCode);

        const outPath = path.join(STORAGE_DIR, `state-${i}.json`);
        await page.context().storageState({ path: outPath });
        console.log(`✅ Saved ${outPath}`);

        await browser.close();
    }

    console.log(`🎉 Done! ${COUNT} unique storage states created in ${STORAGE_DIR}`);
})();
