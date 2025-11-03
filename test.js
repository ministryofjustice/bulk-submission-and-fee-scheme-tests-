import { authenticator } from 'otplib';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const secret = process.env.MFA_SECRET;

if (!secret) {
    console.error('❌ Missing MFA_SECRET in .env');
    process.exit(1);
}

// Generate code (pass encoding explicitly)
const code = authenticator.generate(secret, { encoding: 'base32' });
console.log(`✅ Your current Microsoft Authenticator code: ${code}`);

// Calculate remaining time before expiry
const remaining = 30 - (Math.floor(Date.now() / 1000) % 30);
console.log(`⏱ Code valid for another ${remaining} seconds`);

// Optional local verification
const verified = authenticator.verify({ token: code, secret, encoding: 'base32' });
console.log(`🔍 Local verification result: ${verified ? '✔️ OK' : '❌ FAILED'}`);