import { CONFIG_KEY } from '../shesha-constants';

export interface IAppConfigManager {
  readonly baseUrl?: string;
}

export class ConfigManager<T extends IAppConfigManager> {
  private config: T;

  constructor(conf?: T, configKey = CONFIG_KEY) {
    try {
      this.config = conf ?? window[configKey];
    } catch (error) {
      this.config = conf;
    }
  }

  public getConfig(configKey = CONFIG_KEY): T {
    try {
      return this.config ?? window[configKey];
    } catch (error) {
      return null;
    }
  }
}

export default ConfigManager;
