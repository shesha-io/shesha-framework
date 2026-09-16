import { camelCase } from './string';
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

const shaEnv: IAppConfigManager = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? '',
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? null,
  appInsightsInstrumentationKey: process.env.NEXT_PUBLIC_APPINSIGHTS_KEY ?? null,
};

export default class ConfigManager {
  private devConfig = { ...camelCase(shaEnv) };

  getConfig(): IAppConfigManager {
    try {
      if (process.env.NODE_ENV !== 'production' && !shaEnv?.baseUrl) {
        if (typeof window !== 'undefined') {
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
