import { useAxiosRequestConfig } from "@/hooks/useAxiosRequestConfig";
import { HttpClientApi, HttpResponse } from "./api";
import { useEffect, useState } from "react";
import axios, { AxiosRequestConfig } from "axios";

export class AxiosHttpClient implements HttpClientApi {
    #axiosConfig: AxiosRequestConfig;
    get<T = any, R = HttpResponse<T>>(url: string): Promise<R> {
        return axios.get(url, this.#axiosConfig);
    }
    delete<T = any, R = HttpResponse<T>>(url: string): Promise<R> {
        return axios.delete(url, this.#axiosConfig);
    }
    head<T = any, R = HttpResponse<T>>(url: string): Promise<R> {
        return axios.head(url, this.#axiosConfig);
    }
    options<T = any, R = HttpResponse<T>>(url: string): Promise<R> {
        return axios.options(url, this.#axiosConfig);
    }
    post<T = any, R = HttpResponse<T>>(url: string, data?: any): Promise<R> {
        return axios.post(url, data, this.#axiosConfig);
    }
    put<T = any, R = HttpResponse<T>>(url: string, data?: any): Promise<R> {
        return axios.put(url, data, this.#axiosConfig);
    }
    patch<T = any, R = HttpResponse<T>>(url: string, data?: any): Promise<R> {
        return axios.patch(url, data, this.#axiosConfig);
    }

    setConfig(axiosConfig: AxiosRequestConfig) {
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