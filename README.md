# 🧪 LAA Bulk Claims E2E Tests

Automated **end-to-end (E2E)** tests for the **LAA Bulk Claims** platform using **Playwright**, **Cucumber.js**, and **BrowserStack**.  
This project supports both **UI** and **API** test automation, integrated with parallel execution and automatic reporting.

---

## 📋 Table of Contents

- [📁 Project Structure](#-project-structure)
- [⚙️ Setup & Installation](#️-setup--installation)
- [🧩 BrowserStack Configuration](#-browserstack-configuration)
- [🧠 Scripts](#-scripts)
- [🧭 How to Run Tests](#-how-to-run-tests)
- [🧰 Key Features](#-key-features)
- [📸 Reports & Logs](#-reports--logs)
- [🧼 Cleanup Logic](#-cleanup-logic)
- [🧪 Example Feature](#-example-feature)
- [🧱 Tech Stack](#-tech-stack)
- [🧩 Developer Notes](#-developer-notes)
- [⛙ GitHub Workflows](#-github-workflows)
- [🔁 Reusable Workflow for External Repositories](#-reusable-workflow-for-external-repositories)

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
├── docker-compose.yml         # Used by GitHub workflow to run all services on the runner
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

| Script                  | Description                                                                                                                                        |
|-------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| `test`                  | Runs all tests (UI + API) and generates reports                                                                                                    |
| `test:smoke`            | Runs smoke tests tagged with `@smoke`                                                                                                              |
| `test:api`              | Runs API-only tests (`@api`)                                                                                                                       |
| `test:ui`               | Runs UI-only tests (`@ui`)                                                                                                                         |
| `test:e2e:browserstack` | Runs tests on BrowserStack in parallel                                                                                                             |
| `login`                 | Executes authentication setup script before tests, used to login via SILAS                                                                         |
| `login:mock`            | Executes authentication setup script before tests, used to login via [Mock OIDC server](https://github.com/ministryofjustice/laa-oidc-mock-server) |
| `teardown`              | Cleans up submissions from the database                                                                                                            |
| `report:bdd`            | Generates BDD-style HTML reports                                                                                                                   |
| `test:report`           | Opens Playwright HTML report                                                                                                                       |
| `login-browserstack`    | Authenticates via BrowserStack before running tests                                                                                                |

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

## ⛙ GitHub Workflows

This repository uses two GitHub Actions workflows to run end-to-end tests in UAT and to support running the same tests on a self-hosted runner with Docker Compose.

### 1) `tests.yml` — Run E2E Tests

This is the main workflow for running tests against deployed UAT services.

#### When it runs
- On pushes to `main`
- On pull requests targeting `main`
- Manually via `workflow_dispatch`
- On a weekday schedule at 6pm UTC

#### What it does
This workflow is split into a few jobs:

- **UAT deployment summary**
  - Collects the deployed versions of the UAT services.
  - Publishes a summary table into the GitHub Actions run summary.

- **Ensure GitHub Runner Available**
  - Checks whether a self-hosted GitHub runner is already running in Kubernetes.
  - If the runner is missing, it deploys one automatically.

- **API tests**
  - Runs API-focused tests in a Playwright container.
  - Port-forwards to the FSP API and writes a Cucumber summary.
  - Uploads test reports as artifacts.

- **UI accessibility tests**
  - Runs accessibility-focused UI tests on the self-hosted runner.
  - Uses BrowserStack and generates reports.
  - Runs cleanup and uploads artifacts even if the test fails.

- **UI tests**
  - Runs the main browser-based E2E test suite on the self-hosted runner.
  - Uses the same shared setup as the accessibility job.
  - Generates summaries and uploads reports at the end.

#### Key behaviour
- The workflow uses Kubernetes authentication to reach UAT services.
- Some jobs create a temporary `.env` file at runtime for test configuration.
- Report generation and cleanup are designed to run even when tests fail.
- Test outputs are uploaded to GitHub Actions as artifacts for later inspection.

---

### 2) `run-tests-on-runner.yml` — Run E2E Tests via Docker Compose

This workflow is intended for running the test suite on a GitHub runner using locally started Docker containers.

#### When it runs
- Manually via `workflow_dispatch`

#### Inputs
- `test_annotation` — which tagged tests to run
- `run_id` — a label used in the workflow run name
- `sabc_image_tag` — optional override for the Submit a Bulk Claim image
- `claims_api_image_tag` — optional override for the Claims API image
- `claims_events_image_tag` — optional override for the Claims Events image

#### What it does
This workflow has two jobs:

- **get-app-versions**
  - Collects the image tags currently deployed in UAT.
  - Uses those tags as the default versions for the test run unless overrides are supplied.
  - Publishes a version summary to the Actions run summary.

- **run-tests**
  - Sets up Node.js and Playwright.
  - Pulls the required service images from ECR.
  - Authenticates to the relevant Kubernetes clusters.
  - Port-forwards the FSP API and PDA API endpoints.
  - Starts the required services with Docker Compose.
  - Waits for services and the database to become ready.
  - Runs the test suite with the requested tag filter.
  - Collects logs, tears everything down, and uploads reports.

#### Key behaviour
- This workflow is useful when you want to test a specific set of service images without relying entirely on deployed UAT versions.
- It includes extra debugging steps for service health checks and container logs.
- The OIDC host mapping is adjusted so tests can use the same hostname as they would in containerized environments.

#### Example call to trigger the workflow from another repository
```yaml
      - name: Dispatch target workflow
        id: dispatch
        env:
          GH_TOKEN: ${{ steps.get_workflow_token.outputs.token }}
          TARGET_REPO: ministryofjustice/bulk-submission-and-fee-scheme-tests-
          TARGET_WORKFLOW_FILE: test-compose.yml
          SABC_IMAGE_TAG: ${{ inputs.sabc_image_tag }}
          TEST_ANNOTATION: ${{ inputs.test_annotation }}
        run: |
          set -euo pipefail

          # Record time BEFORE dispatching
          DISPATCH_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
          echo "dispatch_time=${DISPATCH_TIME}" >> "$GITHUB_OUTPUT"
          echo "Dispatched at ${DISPATCH_TIME}"

          echo "Dispatching E2E in ${TARGET_REPO}"
          gh api -X POST "repos/${TARGET_REPO}/actions/workflows/test-compose.yml/dispatches" \
            -f ref="${TARGET_REF}" \
            -f inputs[test_annotation]="${TEST_ANNOTATION}" \
            -f inputs[sabc_image_tag]="${SABC_IMAGE_TAG}" \
            -f inputs[run_id]="${SABC_IMAGE_TAG}"
```

---

### Workflow selection guide

- Use **`tests.yml`** for normal CI runs against UAT.
- Use **`run-tests-on-runner.yml`** when you want to run tests against Docker Compose with optional image overrides.

---

### Related files
- `.github/workflows/tests.yml`
- `.github/workflows/run-tests-on-runner.yml`
- `.github/actions/collect-deployment-version`
- `.github/actions/port-forward-service`
- `.github/actions/pull-ecr-image`

## 🔁 Reusable Workflow for External Repositories

This repository also provides a reusable GitHub workflow that is intended to be called by **other repositories**, not by this one directly.

### `trigger-e2e-dispatch.yml`

This workflow acts as a dispatcher for E2E test runs in this repository.

#### Purpose
It allows another repository to:
- trigger an E2E test run here,
- pass in the image tag and test annotation to use,
- wait for the run to be created,
- and poll until the remote workflow completes.

#### How it is used
This workflow is designed to be called with `workflow_call` from another repository's workflow.

#### What it does
- Creates an authenticated GitHub App token.
- Dispatches the `run-tests-on-runner.yml` workflow in this repository.
- Passes through the requested test annotation and image tag.
- Locates the created workflow run.
- Adds a link to the run in the calling workflow summary.
- Polls until the triggered workflow finishes.
- Fails if the remote workflow fails or times out.

#### Typical use case
Use this when another repository wants to:
- test a specific application image against this project’s E2E suite,
- coordinate test execution from its own CI pipeline,
- and receive a pass/fail result without manually visiting the Actions page.

#### Notes
- This workflow is not meant to run tests itself.
- It exists to bridge external repositories to the E2E runner workflow in this repository.
- The calling repository must provide the required GitHub App credentials and test inputs.

### Related workflow
- `.github/workflows/run-tests-on-runner.yml`