// import { setWorldConstructor, IWorldOptions, DataTable } from '@cucumber/cucumber';
// import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
// import { chromium, firefox, webkit, Browser, BrowserContext, Page, LaunchOptions, BrowserType } from 'playwright';
// import dotenv from 'dotenv';
//
// import { LoginPage } from '../../pages/LoginPage';
// import { BulkImportPage } from '../../pages/bulkImportPage';
// import { BulkClaimSubmitPage } from '../../pages/BulkClaimSubmitPage';
// import { SubmissionSummaryPage } from '../../pages/SubmissionSummaryPage';
// import { SubmissionDetailPage } from '../../pages/SubmissionDetailPage';
// import { BulkInProgressPage } from '../../pages/BulkInProgressPage';
//
// dotenv.config();
//
// export class World {
//   attach!: (data: string | Buffer, mediaType?: string) => Promise<void>;
//
//   // ===== API state =====
//   client: AxiosInstance;
//   response?: AxiosResponse;
//   requestBody?: Record<string, any>;
//   error?: AxiosError;
//
//   // ===== UI state =====
//   browser?: Browser;
//   context?: BrowserContext;
//   page?: Page;
//   browserName?: string; // <--- added
//   fileName?: string;
//   ref?: string;
//
//   // ===== Page objects =====
//   loginPage?: LoginPage;
//   bulkImportPage?: BulkImportPage;
//   bulkClaimSubmitPage?: BulkClaimSubmitPage;
//   submissionSummaryPage?: SubmissionSummaryPage;
//   submissionDetailPage?: SubmissionDetailPage;
//   bulkInProgressPage?: BulkInProgressPage;
//
//   // ===== Misc state =====
//   mostRecentSubmissionId: any;
//   searchFromDate: any;
//   searchToDate: any;
//   expectedCount?: number;
//   allSubmissionIds: any;
//
//   generatedFilePath?: string;
//   submissionPeriod?: string;
//   filePath?: string;
//   currentScenarioName?: string;
//   pid?: number;
//
//   constructor(options: IWorldOptions) {
//     // @ts-ignore
//     this.attach = options.attach;
//
//     const headers: Record<string, string> = {
//       'Content-Type': 'application/json',
//       Accept: 'application/json',
//     };
//
//     const token = process.env.FSP_API_TOKEN;
//     if (token) headers.Authorization = token;
//
//     this.client = axios.create({
//       baseURL: process.env.FSP_API_BASE_URL,
//       timeout: 10000,
//       headers,
//       validateStatus: () => true,
//     });
//   }
//
//   // ===== API helpers =====
//   async get(path: string) {
//     this.error = undefined;
//     this.response = await this.client.get(path);
//     return this.response;
//   }
//
//   async post(path: string, body: any) {
//     this.error = undefined;
//     this.response = await this.client.post(path, body);
//     return this.response;
//   }
//
//   setPayloadFromTable(table: DataTable) {
//     const payload: Record<string, any> = {};
//     for (const [k, v] of table.rows()) payload[k] = this.coerce(v);
//     this.requestBody = payload;
//   }
//
//   setPayload(payload: Record<string, any>) {
//     this.requestBody = payload;
//   }
//
//   getByPath(obj: unknown, path: string): unknown {
//     return path.split('.').reduce((acc: any, key: string) => (acc == null ? acc : acc[key]), obj as any);
//   }
//
//   // ===== UI helpers =====
//   async openBrowser(
//       browserType: BrowserType = chromium, // 👈 allows dynamic selection
//       opts: LaunchOptions = { headless: process.env.HEADLESS === 'true' }
//   ) {
//     this.pid = process.pid;
//     this.browserName = browserType.name();
//     console.log(`🧩 Allocating PID ${this.pid} using ${this.browserName}`);
//
//     // Option A: Connect to remote grid
//     if (process.env.REMOTE_URL) {
//       const wsEndpoint = process.env.REMOTE_URL.replace('chromium', this.browserName);
//       this.browser = await browserType.connect({ wsEndpoint });
//     }
//     // Option B: Local launch
//     else {
//       this.browser = await browserType.launch(opts);
//     }
//
//     console.log(`🌐 ${this.browserName} browser started for PID ${this.pid}`);
//
//     // Register for tracking
//     (global as any).__scenarioRegistry = (global as any).__scenarioRegistry || {};
//     (global as any).__scenarioRegistry[this.pid] = this.currentScenarioName || 'UnnamedScenario';
//   }
//
//   async goto(urlPath: string) {
//     if (!this.page) throw new Error('Browser not opened! Did you forget to tag this scenario with @ui?');
//     await this.page.goto(urlPath);
//     console.log(`✔️ Landed on: ${this.page.url()}`);
//   }
//
//   private coerce(val: string): any {
//     if (val === 'true') return true;
//     if (val === 'false') return false;
//     if (/^-?\d+(\.\d+)?$/.test(val)) return Number(val);
//     return val;
//   }
//
//   async clearBrowserCache() {
//     if (!this.context) return;
//
//     try {
//       const pages = this.context.pages();
//       for (const p of pages) {
//         await p.evaluate(() => {
//           localStorage.clear();
//           sessionStorage.clear();
//           indexedDB.databases().then((dbs) =>
//               dbs.forEach((db) => indexedDB.deleteDatabase(db.name!))
//           );
//           if ('caches' in window) caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
//         });
//       }
//
//       await this.context.clearCookies();
//       await this.context.clearPermissions();
//       console.log(`🧽 Cleared storage, cookies, and caches for PID ${this.pid}`);
//     } catch (err) {
//       console.warn(`⚠️ Failed to clear browser cache:`, err);
//     }
//   }
// }
//
// setWorldConstructor(World);
// export default World;
// export type CustomWorld = World;


import { setWorldConstructor, IWorldOptions, DataTable } from '@cucumber/cucumber';
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import {
  chromium,
  firefox,
  webkit,
  Browser,
  BrowserContext,
  Page,
  LaunchOptions,
  BrowserType
} from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

import { LoginPage } from '../../pages/LoginPage';
import { BulkImportPage } from '../../pages/bulkImportPage';
import { BulkClaimSubmitPage } from '../../pages/BulkClaimSubmitPage';
import { SubmissionSummaryPage } from '../../pages/SubmissionSummaryPage';
import { SubmissionDetailPage } from '../../pages/SubmissionDetailPage';
import { BulkInProgressPage } from '../../pages/BulkInProgressPage';

dotenv.config();

export class World {
  attach!: (data: string | Buffer, mediaType?: string) => Promise<void>;

  // ===== API state =====
  client: AxiosInstance;
  response?: AxiosResponse;
  requestBody?: Record<string, any>;
  error?: AxiosError;

  // ===== UI state =====
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  browserName?: string;
  fileName?: string;
  ref?: string;

  // ===== Page objects =====
  loginPage?: LoginPage;
  bulkImportPage?: BulkImportPage;
  bulkClaimSubmitPage?: BulkClaimSubmitPage;
  submissionSummaryPage?: SubmissionSummaryPage;
  submissionDetailPage?: SubmissionDetailPage;
  bulkInProgressPage?: BulkInProgressPage;

  // ===== Misc =====
  mostRecentSubmissionId: any;
  searchFromDate: any;
  searchToDate: any;
  expectedCount?: number;
  allSubmissionIds: any;
  generatedFilePath?: string;
  submissionPeriod?: string;
  filePath?: string;
  currentScenarioName?: string;
  pid?: number;

  constructor(options: IWorldOptions) {
    // @ts-ignore
    this.attach = options.attach;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const token = process.env.FSP_API_TOKEN;
    if (token) headers.Authorization = token;

    this.client = axios.create({
      baseURL: process.env.FSP_API_BASE_URL,
      timeout: 10000,
      headers,
      validateStatus: () => true,
    });
  }

  // ===== API helpers =====
  async get(path: string) {
    this.error = undefined;
    this.response = await this.client.get(path);
    return this.response;
  }

  async post(path: string, body: any) {
    this.error = undefined;
    this.response = await this.client.post(path, body);
    return this.response;
  }

  setPayloadFromTable(table: DataTable) {
    const payload: Record<string, any> = {};
    for (const [k, v] of table.rows()) payload[k] = this.coerce(v);
    this.requestBody = payload;
  }

  setPayload(payload: Record<string, any>) {
    this.requestBody = payload;
  }

  getByPath(obj: unknown, path: string): unknown {
    return path.split('.').reduce((acc: any, key: string) => (acc == null ? acc : acc[key]), obj as any);
  }

  // ===== UI helpers =====
  async openBrowser(
      browserType: BrowserType = chromium,
      opts: LaunchOptions = { headless: process.env.HEADLESS === 'true' }
  ) {
    this.pid = process.pid;
    this.browserName = browserType.name();
    console.log(`🧩 PID ${this.pid} requesting ${this.browserName} instance...`);

    // Grid servers (can be overridden by REMOTE_URL)
    const GRID_SERVERS = [
      'ws://localhost:4444',
      'ws://localhost:4445',
      'ws://localhost:4446',
      'ws://localhost:4447'
    ];

    let selectedGrid: string | undefined;

    try {
      // If REMOTE_URL defined, use it directly
      if (process.env.REMOTE_URL) {
        selectedGrid = process.env.REMOTE_URL;
      } else {
        // Rotate between available grid servers based on PID
        selectedGrid = GRID_SERVERS[this.pid % GRID_SERVERS.length];
      }

      console.log(`🔗 Connecting to grid: ${selectedGrid}`);
      this.browser = await browserType.connect({ wsEndpoint: selectedGrid });
      console.log(`🌐 Connected to remote grid: ${selectedGrid}`);
    } catch (err) {
      console.warn(`⚠️ Could not connect to ${selectedGrid}. Launching locally instead.`, err);
      this.browser = await browserType.launch(opts);
      console.log(`🖥️  Local ${this.browserName} launched.`);
    }

    // === AUTH STATE MAPPING ===
    const statesDir = path.resolve('tests/auth-states');
    let selectedState: string | undefined;

    if (fs.existsSync(statesDir)) {
      const allStates = fs.readdirSync(statesDir).filter((f) => f.endsWith('.json')).sort();
      if (allStates.length > 0) {
        // Map grid port or worker to deterministic file
        const gridIndex = GRID_SERVERS.indexOf(selectedGrid!);
        selectedState = path.join(statesDir, allStates[gridIndex % allStates.length]);
        console.log(`🔑 Using pre-generated auth state: ${path.basename(selectedState)}`);
      }
    } else {
      console.warn('⚠️ No auth-states directory found.');
    }

    // === Create isolated context with storage state ===
    this.context = await this.browser.newContext({
      baseURL: process.env.UI_BASE_URL,
      ignoreHTTPSErrors: true,
      storageState: selectedState,
    });

    this.page = await this.context.newPage();
    console.log(`✅ ${this.browserName} context ready for PID ${this.pid} using ${path.basename(selectedState || 'no-state')}`);

    // Register scenario context
    (global as any).__scenarioRegistry = (global as any).__scenarioRegistry || {};
    (global as any).__scenarioRegistry[this.pid] = this.currentScenarioName || 'UnnamedScenario';
  }

  async goto(urlPath: string) {
    if (!this.page) throw new Error('Browser not opened! Did you forget to tag this scenario with @ui?');
    await this.page.goto(urlPath);
    console.log(`✔️ Navigated to: ${this.page.url()}`);
  }

  private coerce(val: string): any {
    if (val === 'true') return true;
    if (val === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(val)) return Number(val);
    return val;
  }

  async clearBrowserCache() {
    if (!this.context) return;

    try {
      const pages = this.context.pages();
      for (const p of pages) {
        await p.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
          indexedDB.databases().then((dbs) => dbs.forEach((db) => indexedDB.deleteDatabase(db.name!)));
          if ('caches' in window) caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
        });
      }

      await this.context.clearCookies();
      await this.context.clearPermissions();
      console.log(`🧽 Cleared storage, cookies, and caches for PID ${this.pid}`);
    } catch (err) {
      console.warn(`⚠️ Failed to clear browser cache:`, err);
    }
  }

  async closeBrowser() {
    try {
      if (this.page) await this.page.close();
      if (this.context) await this.context.close();
      if (this.browser) await this.browser.close();
      console.log(`🧹 Closed browser for PID ${this.pid}`);
    } catch (err) {
      console.warn(`⚠️ Error closing browser:`, err);
    }
  }
}

setWorldConstructor(World);
export default World;
export type CustomWorld = World;
