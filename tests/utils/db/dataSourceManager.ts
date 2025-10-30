import { DataSource, DataSourceOptions } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

type ManagerConfig = {
  label: string;
  initialSsl?: boolean;
  overrides?: Partial<DataSourceOptions>;
};

const defaultSslEnabled = (process.env.DB_SSL || 'false').toLowerCase() === 'true';

const buildOptions = (
  useSsl: boolean,
  overrides?: Partial<DataSourceOptions>
): DataSourceOptions => {
  const base: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || '',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || '',
    ssl: useSsl ? { rejectUnauthorized: false } : false,
    synchronize: false,
  };

  return Object.assign(base, overrides ?? {});
};

export type DataSourceManager = {
  readonly label: string;
  getDataSource: () => DataSource;
  ensureInitialized: () => Promise<boolean>;
  destroy: () => Promise<void>;
};

export const createDataSourceManager = (config: ManagerConfig): DataSourceManager => {
  const { label, overrides } = config;
  let useSsl =
    typeof config.initialSsl === 'boolean' ? config.initialSsl : defaultSslEnabled;

  const buildDataSource = (ssl: boolean) => new DataSource(buildOptions(ssl, overrides));

  let dataSource = buildDataSource(useSsl);

  const ensureInitialized = async (): Promise<boolean> => {
    if (dataSource.isInitialized) return true;

    try {
      await dataSource.initialize();
      console.log(
        `✅ [${label}] Database connection established${useSsl ? '' : ' (no SSL)'}`
      );
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const normalized = message.toLowerCase();

      if (useSsl && normalized.includes('does not support ssl')) {
        console.warn(`⚠️ [${label}] Database does not support SSL. Retrying without SSL.`);
        useSsl = false;
        dataSource = buildDataSource(false);
        try {
          await dataSource.initialize();
          console.log(`✅ [${label}] Database connection established (no SSL)`);
          return true;
        } catch (innerErr) {
          const innerMessage = innerErr instanceof Error ? innerErr.message : String(innerErr);
          console.warn(
            `⚠️ [${label}] Unable to connect to the database without SSL.`,
            innerMessage
          );
          return false;
        }
      }

      console.warn(`⚠️ [${label}] Unable to connect to the database.`, message);
      return false;
    }
  };

  const destroy = async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log(`🔒 [${label}] Database connection closed`);
    }
  };

  return {
    label,
    getDataSource: () => dataSource,
    ensureInitialized,
    destroy,
  };
};
