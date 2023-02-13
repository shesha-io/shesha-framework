import { useEffect, useState } from 'react';
import { CONFIG_KEY } from '../constants';

export interface IAppConfigType {
  baseUrl: string;
}

export interface IApplicationConfiguration<T> {
  config: T;
}

export function useApplicationConfiguration<T extends IAppConfigType>(
  configKey: string = CONFIG_KEY,
  initialConfig?: T
): IApplicationConfiguration<T> {
  const [config, setConfig] = useState<T>(initialConfig);

  useEffect(() => {
    if (window && !config) {
      setConfig(window[configKey]);
    }
  }, [typeof window]);

  return { config };
}
