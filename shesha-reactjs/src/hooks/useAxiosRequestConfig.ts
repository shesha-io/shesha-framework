import { useSheshaApplication } from '@/providers';
import { AxiosRequestConfig } from 'axios';
import { useMemo } from 'react';

/**
 * Returns the Axios request configuration object with the backend URL and HTTP headers.
 *
 * @return {AxiosRequestConfig} The Axios request configuration object with baseURL and headers
 */
export const useAxiosRequestConfig = (): AxiosRequestConfig => {
  const { backendUrl, httpHeaders, buildHttpRequestConfig } = useSheshaApplication();

  let defaultConfig: AxiosRequestConfig = {
    headers: httpHeaders,
    baseURL: backendUrl,
  };

  // If a custom request transformation function is provided, use it to get the config
  if (buildHttpRequestConfig) {
    const generatedConfig = buildHttpRequestConfig();
    defaultConfig = {
      ...defaultConfig,
      ...generatedConfig,
    };
  }

  return useMemo<AxiosRequestConfig>(() => {
    return {
      ...defaultConfig,
      headers: {
        ...defaultConfig.headers,
      },
    };
  }, [backendUrl, defaultConfig]);
};
