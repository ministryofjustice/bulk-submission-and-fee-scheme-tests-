// tests/features/support/world.ts
import { setWorldConstructor, IWorldOptions } from '@cucumber/cucumber';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  chromium,
  Browser,
  BrowserContext,
  Page,
  LaunchOptions
} from 'playwright';
import { LoginPage } from '../../pages/LoginPage';
import { SampleLoginPage } from '../../pages/SampleLoginPage';

export interface CustomWorld {
  // API
  client: AxiosInstance;
  response?: AxiosResponse;

  // UI
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  openBrowser(opts?: LaunchOptions): Promise<void>;
  goto(path: string): Promise<void>;

  // Page objects
  loginPage?: LoginPage;
  sampleLoginPage?: SampleLoginPage; // Assuming you might have another page object
}

export class World implements CustomWorld {
  client: AxiosInstance;
  response?: AxiosResponse;
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  loginPage?: LoginPage;

  constructor(options: IWorldOptions) {
    // Initialize API client
    this.client = axios.create({ baseURL: process.env.API_BASE_URL });
  }

  // API helper
  async get(path: string) {
    this.response = await this.client.get(path);
    return this.response;
  }

  // UI helpers
  async openBrowser(opts: LaunchOptions = { headless: process.env.HEADLESS === 'true' }) {
    this.browser = await chromium.launch(opts);
    // Create a context with baseURL so page.goto('/...') works
    this.context = await this.browser.newContext({
      baseURL: process.env.UI_BASE_URL,
    });
    this.page = await this.context.newPage();
  }

  async goto(path: string) {
    if (!this.page) {
      throw new Error('Browser not opened! Did you forget to tag this scenario with @ui?');
    }
    // With context.baseURL set, this will resolve correctly
    await this.page.goto(path);
    console.log(`✔️  Landed on: ${this.page.url()}`);
  }
}

setWorldConstructor(World);
