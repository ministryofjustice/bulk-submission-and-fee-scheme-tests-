import { setWorldConstructor, IWorldOptions, DataTable } from '@cucumber/cucumber';
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { chromium, Browser, BrowserContext, Page, LaunchOptions } from 'playwright';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
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
  fileName?: string;
  ref?: string;
  loginPage?: LoginPage;
  bulkImportPage?: BulkImportPage;
  bulkClaimSubmitPage?: BulkClaimSubmitPage;
  submissionSummaryPage?: SubmissionSummaryPage;
  submissionDetailPage?: SubmissionDetailPage;
  bulkInProgressPage?: BulkInProgressPage;
  mostRecentSubmissionId: any;
  searchFromDate: any;
  searchToDate: any;
  expectedCount: number | undefined;
  allSubmissionIds: any;

  generatedFilePath: string | undefined;
  matterStartCounts?: Record<string, number>;
  cleanupSubmissionIds: Set<string>;
  submissionReference?: string;
  officeAccount?: string;
  submissionPeriod: string | undefined;
  filePath: string | undefined;
  currentScenarioName: string | undefined;

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
      validateStatus: () => true, // allow manual status inspection
    });

    this.cleanupSubmissionIds = new Set();
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
  async openBrowser(opts: LaunchOptions = { headless: process.env.HEADLESS === 'true' }) {
    (global as any).__browsers = (global as any).__browsers || {};
    let browser = (global as any).__browsers[process.pid];

    if (!browser) {
      browser = await chromium.launch(opts);
      (global as any).__browsers[process.pid] = browser;
      console.log(`🌐 Launched new browser for PID ${process.pid}`);
    } else {
      console.log(`♻️ Reusing existing browser for PID ${process.pid}`);
    }

    this.browser = browser;
  }

  async goto(path: string) {
    if (!this.page) throw new Error('Browser not opened! Did you forget to tag this scenario with @ui?');
    await this.page.goto(path);
    console.log(`✔️  Landed on: ${this.page.url()}`);
  }

  // ===== private utils =====
  private coerce(val: string): any {
    if (val === 'true') return true;
    if (val === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(val)) return Number(val);
    return val;
  }
}

setWorldConstructor(World);
export default World;
export type CustomWorld = World;
