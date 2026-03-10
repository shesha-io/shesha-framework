import { useAxiosRequestConfig } from "@/hooks/useAxiosRequestConfig";
import { HttpClientApi, HttpRequestConfig, HttpResponse } from "@/publicJsApis/httpClient";
import { useEffect, useState } from "react";
import axios, { AxiosRequestConfig } from "axios";

export class AxiosHttpClient implements HttpClientApi {
  #axiosConfig: AxiosRequestConfig;

  #getRequestConfig = (config?: HttpRequestConfig): AxiosRequestConfig => {
    if (!config)
      return this.#axiosConfig;

    const headers = { ...(config.omitStandardHeaders ? {} : this.#axiosConfig.headers), ...config.headers };

    const timeout = config.timeout === undefined
      ? this.#axiosConfig.timeout
      : config.timeout;

    return {
      ...this.#axiosConfig,
      headers,
      timeout,
      responseType: config.responseType,
    };
  };

  get<T = any, R = HttpResponse<T>>(url: string, config?: HttpRequestConfig): Promise<R> {
    return axios.get(url, this.#getRequestConfig(config));
  }

  delete<T = any, R = HttpResponse<T>>(url: string, config?: HttpRequestConfig): Promise<R> {
    return axios.delete(url, this.#getRequestConfig(config));
  }

  head<T = any, R = HttpResponse<T>>(url: string, config?: HttpRequestConfig): Promise<R> {
    return axios.head(url, this.#getRequestConfig(config));
  }

  options<T = any, R = HttpResponse<T>>(url: string, config?: HttpRequestConfig): Promise<R> {
    return axios.options(url, this.#getRequestConfig(config));
  }

  post<T = any, R = HttpResponse<T>>(url: string, data?: T, config?: HttpRequestConfig): Promise<R> {
    return axios.post(url, data, this.#getRequestConfig(config));
  }

  put<T = any, R = HttpResponse<T>>(url: string, data?: T, config?: HttpRequestConfig): Promise<R> {
    return axios.put(url, data, this.#getRequestConfig(config));
  }

  patch<T = any, R = HttpResponse<T>>(url: string, data?: T, config?: HttpRequestConfig): Promise<R> {
    return axios.patch(url, data, this.#getRequestConfig(config));
  }

  setConfig(axiosConfig: AxiosRequestConfig): void {
    this.#axiosConfig = axiosConfig;
  }

  constructor(axiosConfig: AxiosRequestConfig) {
    this.#axiosConfig = axiosConfig;
  }
}

/**
 * Returns an instance of HttpClientApi that allows making HTTP requests using Axios.
 *
 * @return {HttpClientApi} An instance of HttpClientApi for making HTTP requests.
 */
export const useHttpClient = (): HttpClientApi => {
  const axiosConfig = useAxiosRequestConfig();
  const [httpClient] = useState<AxiosHttpClient>(() => {
    return new AxiosHttpClient(axiosConfig);
  });
  useEffect(() => {
    httpClient.setConfig(axiosConfig);
  }, [httpClient, axiosConfig]);

  return httpClient;
};
