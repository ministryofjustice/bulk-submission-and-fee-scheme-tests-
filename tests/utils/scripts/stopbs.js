
const { Local } = require("browserstack-local");


const bsLocal = new Local();

console.log("🛑 Stopping BrowserStack Local...");

bsLocal.stop(() => {
    console.log("✅ BrowserStack Local stopped.");
    process.exit(0);
});