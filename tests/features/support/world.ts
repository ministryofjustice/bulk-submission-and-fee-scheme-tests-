// tests/features/support/world.ts
import { setWorldConstructor, IWorldOptions, DataTable } from '@cucumber/cucumber';
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { chromium, Browser, BrowserContext, Page, LaunchOptions } from 'playwright';
import dotenv from 'dotenv';
import { LoginPage } from '../../pages/LoginPage';
import { BulkImportPage } from '../../pages/bulkImportPage';
import {BulkClaimSubmitPage} from '../../pages/BulkClaimSubmitPage';

dotenv.config();

export class World {
   attach!: (data: string | Buffer, mediaType?: string) => Promise<void>;

  // API
  client: AxiosInstance;
  response?: AxiosResponse;
  requestBody?: Record<string, any>;
  error?: AxiosError;

  // UI
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  fileName?: string;
  openBrowser(opts?: LaunchOptions): Promise<void>;
  goto(path: string): Promise<void>;

  loginPage?: LoginPage;
  bulkImportPage?: BulkImportPage;
  bulkClaimSubmitPage?: BulkClaimSubmitPage;
}

export class World implements CustomWorld {
  client: AxiosInstance;
  response?: AxiosResponse;
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  fileName?: string;
  loginPage?: LoginPage;
  bulkClaimSubmitPage?: BulkClaimSubmitPage;

  constructor(options: IWorldOptions) {
    this.client = axios.create({
      baseURL: process.env.API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      // Let us inspect 4xx/5xx without exceptions
      validateStatus: () => true
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
  async openBrowser(opts: LaunchOptions = { headless: process.env.HEADLESS === 'true' }) {
    this.browser = await chromium.launch(opts);
    this.context = await this.browser.newContext({ baseURL: process.env.UI_BASE_URL });
    this.page = await this.context.newPage();
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
    // numeric (keep dates like 2013-06-07 as strings)
    if (/^-?\d+(\.\d+)?$/.test(val)) return Number(val);
    return val;
  }
}

setWorldConstructor(World);
export default World;
export type CustomWorld = World;
