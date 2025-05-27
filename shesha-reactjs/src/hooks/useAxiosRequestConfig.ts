import { useSheshaApplication } from '@/providers';
import { AxiosRequestConfig } from 'axios';
import { useMemo } from 'react';

/**
 * Returns the Axios request configuration object with the backend URL and HTTP headers.
 *
 * @return {AxiosRequestConfig} The Axios request configuration object with baseURL and headers
 */
export const useAxiosRequestConfig = (): AxiosRequestConfig => {
  const { backendUrl, httpHeaders, transformHttpRequestConfig } = useSheshaApplication();

  const existingConfig = {
    headers: httpHeaders,
    baseURL: backendUrl,
  };

  // If a custom request transformation function is provided, use it to get the config
  if (transformHttpRequestConfig) {
    const transformedConfig = transformHttpRequestConfig();
    return useMemo<AxiosRequestConfig>(() => {
      return {
        ...existingConfig,
        ...transformedConfig,
        headers: {
          ...existingConfig.headers,
          ...transformedConfig.headers,
        },
      };
    }, [existingConfig, backendUrl, transformedConfig]);
  }

  return useMemo<AxiosRequestConfig>(() => {
    return {
      ...existingConfig,
      headers: {
        ...existingConfig.headers,
      },
    };
  }, [backendUrl, existingConfig]);
};
