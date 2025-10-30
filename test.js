import { authenticator } from 'otplib';
import dotenv from 'dotenv';

dotenv.config(); // loads .env

const secret = process.env.MFA_SECRET;
if (!secret) {
    console.error('Missing MFA_SECRET in .env');
    process.exit(1);
}

const code = authenticator.generate(secret);
console.log('Your current Microsoft Authenticator code:', code);