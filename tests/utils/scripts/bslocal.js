// @ts-ignore
const { Local } = require("browserstack-local");
const dotenv = require('dotenv');

dotenv.config();

const bsLocal = new Local();
const key = process.env.BROWSERSTACK_ACCESS_KEY;

// Generate or read local identifier (used for CI safety)
const localIdentifier = process.env.BROWSERSTACK_LOCAL_IDENTIFIER || `local-${Date.now()}`;

console.log(`🌐 Starting BrowserStack Local (ID: ${localIdentifier})...`);

bsLocal.start({ key, forceLocal: true, localIdentifier }, (error) => {
    if (error) {
        console.error("❌ Failed to start BrowserStack Local:", error);
        process.exit(1);
    }

    if (bsLocal.isRunning()) {
        console.log(`✅ BrowserStack Local tunnel is running (ID: ${localIdentifier})`);
        // Optionally keep it running in background if needed
        process.exit(0);
    } else {
        console.error("❌ Tunnel failed to start");
        process.exit(1);
    }
});
