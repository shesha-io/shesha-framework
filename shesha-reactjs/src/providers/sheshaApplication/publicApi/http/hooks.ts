"use client";

import { useAxiosRequestConfig } from "@/hooks/useAxiosRequestConfig";
import { HttpClientApi, HttpRequestConfig, HttpResponse } from "@/publicJsApis/httpClient";
import { useEffect, useState } from "react";
import axios, { AxiosRequestConfig } from "axios";
import { isDefined } from "@/utils/nullables";

export class AxiosHttpClient implements HttpClientApi {
  #axiosConfig: AxiosRequestConfig;

  #getRequestConfig = (config?: HttpRequestConfig): AxiosRequestConfig => {
    if (!isDefined(config))
      return this.#axiosConfig;

    const headers = { ...(config.omitStandardHeaders ? {} : this.#axiosConfig.headers), ...config.headers };

    const finalConfig: AxiosRequestConfig = {
      ...this.#axiosConfig,
      headers,
    };

    if (config.timeout)
      finalConfig.timeout = config.timeout;

    if (isDefined(config.responseType))
      finalConfig.responseType = config.responseType;

    return finalConfig;
  };

  get<T = unknown>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return axios.get(url, this.#getRequestConfig(config));
  }

  delete<T = unknown>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return axios.delete(url, this.#getRequestConfig(config));
  }

  head<T = unknown>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return axios.head(url, this.#getRequestConfig(config));
  }

  options<T = unknown>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return axios.options(url, this.#getRequestConfig(config));
  }

  post<T = unknown, D = unknown>(url: string, data?: D, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return axios.post(url, data, this.#getRequestConfig(config));
  }

  put<T = unknown, D = unknown>(url: string, data?: D, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return axios.put(url, data, this.#getRequestConfig(config));
  }

  patch<T = unknown, D = unknown>(url: string, data?: D, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
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
