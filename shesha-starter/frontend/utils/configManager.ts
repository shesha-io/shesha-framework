import getGlobalConfig from 'next/config';
import { camelCase } from './string';
const { publicRuntimeConfig } = getGlobalConfig();

const { shaEnv } = publicRuntimeConfig as IShaEnvAppConfig ?? {};

type IShaEnvAppConfig = { shaEnv: IAppConfigManager };

const CONFIG_KEY = '__APP_CONFIG__';

export interface IAppConfigManager {
  readonly baseUrl?: string;
  readonly googleMapsApiKey?: string;
  readonly appInsightsInstrumentationKey?: string;
}

const defaultConfig: IAppConfigManager = {
  baseUrl: '',
  googleMapsApiKey: 'AIzaSyAQv3UvXzYNUlwB-0LCuS7toLdl_z1j2l8',
  appInsightsInstrumentationKey: null,
};

export class ConfigManager {
  private devConfig = { ...camelCase(shaEnv) };

  getConfig(): IAppConfigManager {
    try {
      if (process.env.NODE_ENV !== 'production' && !shaEnv?.baseUrl) {
        if (window) {
          this.devConfig = window[CONFIG_KEY];
        } else {
          this.devConfig = defaultConfig;
        }
      }

      return process.env.NODE_ENV === 'production' ? window[CONFIG_KEY] : this.devConfig;
    } catch (error) {
      return defaultConfig;
    }
  }
}
