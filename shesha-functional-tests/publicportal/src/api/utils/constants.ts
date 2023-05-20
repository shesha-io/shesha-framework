import ConfigManager from 'utils/configManager';

export const BASE_URL = new ConfigManager().getConfig().baseUrl;
