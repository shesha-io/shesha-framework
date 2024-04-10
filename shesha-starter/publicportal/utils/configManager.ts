import getGlobalConfig from 'next/config';
import { camelCase } from './string';
const { publicRuntimeConfig } = getGlobalConfig();

const { shaEnv }: IShaEnvAppConfig = publicRuntimeConfig;

type IShaEnvAppConfig = { shaEnv: IAppConfigManager };

const CONFIG_KEY = '__APP_CONFIG__';

export interface IAppConfigManager {
  readonly baseUrl?: string;
  readonly googleMapsApiKey?: string;
  readonly appInsightsInstrumentationKey?: string;
}

const defaultConfig: IAppConfigManager = {
  baseUrl: '',
  googleMapsApiKey: null,
  appInsightsInstrumentationKey: null,
};

export default class ConfigManager {
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
