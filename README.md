# 🧪 LAA Bulk Claims E2E Tests

Automated **end-to-end (E2E)** tests for the **LAA Bulk Claims** platform using **Playwright**, **Cucumber.js**, and **BrowserStack**.  
This project supports both **UI** and **API** test automation, integrated with parallel execution and automatic reporting.

---

## 📁 Project Structure

```
.
├── tests/
│   ├── features/              # Gherkin feature files
│   ├── setup/                 # Pre-test scripts (e.g., login setup)
│   ├── utils/                 # Database + cleanup helpers
│   ├── pages/                 # Page Objects (Playwright models)
│   ├── hooks/                 # Cucumber hooks for setup/teardown
│   └── world/                 # Custom World for managing test state
│
├── reports/                   # HTML, JSON & screenshot reports
├── browserstack.yml           # BrowserStack configuration
├── package.json               # NPM scripts and dependencies
├── tsconfig.json              # TypeScript configuration
├── .env                       # Environment variables (local only)
└── README.md                  # This file
```

---

## ⚙️ Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/ministryofjustice/bulk-submission-and-fee-scheme-tests-.git
cd laa-bulk-claims-e2e-tests
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the project root:

```bash
# --- API Config ---
FSP_API_BASE_URL=https://api.laa-bulk-claims.test
FSP_API_TOKEN=<your-api-token>

# --- UI Config ---
UI_BASE_URL=https://laa-bulk-claims-ui.test
HEADLESS=true

# --- BrowserStack Config ---
BROWSERSTACK_USERNAME=<your-username>
BROWSERSTACK_ACCESS_KEY=<your-access-key>

# --- Optional ---
GITHUB_RUN_NUMBER=local
```

---

## 🧩 BrowserStack Configuration

Your BrowserStack configuration is defined in `browserstack.yml`:

```yaml
# =============================
# BrowserStack Credentials
# =============================
userName: ${BROWSERSTACK_USERNAME}
accessKey: ${BROWSERSTACK_ACCESS_KEY}

# =============================
# Project and Build Information
# =============================
projectName: LAA Bulk Claims E2E Tests
buildName: bulk-submission-e2e-test
buildIdentifier: ${GITHUB_RUN_NUMBER}

# =============================
# Framework Configuration
# =============================
framework: playwright

# =============================
# Platform Configuration
# =============================
platforms:
  - os: OS X
    osVersion: Big Sur
    browserName: Chrome
    browserVersion: latest

# =============================
# Parallelization
# =============================
parallelsPerPlatform: 2

# =============================
# Local Testing Configuration
# =============================
browserstackLocal: true
browserstackLocalOptions:
  forceLocal: true

# =============================
# Debugging and Logs
# =============================
debug: false
networkLogs: true
consoleLogs: info

# =============================
# Reporting & Analytics
# =============================
testObservability: true
testReporting: true
```

---

## 🧠 Scripts

Available via `npm run <script>`:

| Script | Description |
|---------|-------------|
| `test` | Runs all tests (UI + API) and generates reports |
| `test:smoke` | Runs smoke tests tagged with `@smoke` |
| `test:api` | Runs API-only tests (`@api`) |
| `test:ui` | Runs UI-only tests (`@ui`) |
| `test:e2e:browserstack` | Runs tests on BrowserStack in parallel |
| `login` | Executes authentication setup script before tests |
| `teardown` | Cleans up submissions from the database |
| `report:bdd` | Generates BDD-style HTML reports |
| `test:report` | Opens Playwright HTML report |
| `login-browserstack` | Authenticates via BrowserStack before running tests |

---

## 🧭 How to Run Tests

### ▶️ Run Locally
```bash
npm run test:ui
```

### 🌐 Run on BrowserStack
```bash
npm run test:e2e:browserstack
```

> Ensure `browserstack-local` is installed and `.env` credentials are set.

### 🔖 Run Specific Tagged Tests
```bash
npm run test:tag -- --tags "@smoke"
```

---

## 🧰 Key Features

✅ **Playwright for UI automation** – handles browsers, contexts, and isolated states.  
✅ **Cucumber.js** – Gherkin syntax for readable test scenarios.  
✅ **BrowserStack Integration** – cloud execution for multiple browsers and OS combinations.  
✅ **Parallel Execution** – improves test runtime efficiency.  
✅ **Automatic Screenshots on Failures** – for debugging failed UI steps.  
✅ **API Testing Support** – through integrated Axios client.  
✅ **Database Cleanup & State Isolation** – ensures stable test re-runs.  
✅ **Rich Reports** – JSON, HTML, and BDD reports automatically generated.

---

## 📸 Reports & Logs

After test execution:

- HTML Reports: `reports/cucumber.html`
- JSON Reports: `reports/cucumber.json`
- Screenshots: `reports/attachments/`
- Playwright Report (optional):
  ```bash
  npm run test:report
  ```

---

## 🧼 Cleanup Logic

- **BeforeAll** → Clears report directories.
- **AfterStep** → Captures screenshots on failure.
- **AfterAll** → Cleans temporary files and resets DB state.
- **After (tags: @matterStarts)** → Removes submission test data from DB.

---

## 🧪 Example Feature

```gherkin
Feature: Bulk claim submission
  As a legal aid caseworker
  I want to upload and submit bulk claims
  So that I can manage submissions efficiently

  @ui @smoke
  Scenario: Submit a valid bulk claim
    Given I am logged into the Bulk Claims portal
    When I upload a valid bulk claim file
    And I submit the claim
    Then I should see a confirmation message
```

---

## 🧱 Tech Stack

| Tool | Purpose |
|------|----------|
| **Playwright** | UI Automation |
| **Cucumber.js** | BDD Testing Framework |
| **TypeScript** | Strongly Typed Language Support |
| **Axios** | API Testing |
| **BrowserStack** | Cloud-based Cross-browser Testing |
| **Node.js / npm** | Package Management & Script Runner |

---

## 🧩 Developer Notes

- **Storage state isolation** ensures each parallel test runs independently.
- **Headless execution** is default; set `HEADLESS=false` in `.env` to view browser.
- **DB Cleanup** ensures consistent test data between runs.
- All environment variables are configurable via `.env` or CI/CD pipeline secrets.

---

## 🏃Self Hosted GitHub Runner

Some of this repositories GitHub Actions spin up a self-hosted runner to run the tests.
The runner is configured to run on a self built Docker image found in 
`scripts/docker/Dockerfile.e2e-runner` along with the associated `runner_script.sh`.

To test build this image locally, run the following:
```shell
cd scripts
# Platform must be linux/amd64 for Docker to build when running on Apple Silicon
docker build --platform linux/amd64 -f Dockerfile.e2e-runner -t local-e2e-runner:dev .
```

Then you can run this GitHub runner locally using the following command
```shell
docker run --platform linux/amd64 --user root --rm -it \
  -e GITHUB_TOKEN="<YOUR_PAT_TOKEN>" \
  -e GITHUB_REPOSITORY="ministryofjustice/bulk-submission-and-fee-scheme-tests-" \
  -e RUNNER_NAME="local-test-runner" \
  -e RUNNER_LABELS="local-testing" \ 
  -v /var/run/docker.sock:/var/run/docker.sock \
  local-e2e-runner:dev
```

If you make sure your GitHub step uses `runs-on: [self-hosted,linux,X64,local-testing]`,
then it will run on this local runner when you push your commit.