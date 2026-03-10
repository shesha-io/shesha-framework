import { useSheshaApplication } from '@/providers';
import { AxiosRequestConfig } from 'axios';
import { useMemo } from 'react';

/**
 * Returns the Axios request configuration object with the backend URL and HTTP headers.
 *
 * @return {AxiosRequestConfig} The Axios request configuration object with baseURL and headers
 */
export const useAxiosRequestConfig = (): AxiosRequestConfig => {
  const { backendUrl, httpHeaders, buildHttpRequestHeaders } = useSheshaApplication();

  return useMemo<AxiosRequestConfig>(() => {
    return {
      baseURL: backendUrl,
      headers: {
        ...httpHeaders,
        ...buildHttpRequestHeaders?.(),
      },
    };
  }, [backendUrl, httpHeaders, buildHttpRequestHeaders]);
};
