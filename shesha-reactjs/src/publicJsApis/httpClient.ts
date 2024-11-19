/**
 * HTTP response
 */
export interface HttpResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    request?: any;
}

/**
 * Http request configuration
 */
export interface HttpRequestConfig {
    /* Request headers */
    headers?: Record<string, string>;
    /* Timeout in milliseconds */
    timeout?: number;
}

/**
 * HTTP client API
 */
export interface HttpClientApi {
    get<T = any, R = HttpResponse<T>>(url: string, config?: HttpRequestConfig): Promise<R>;
    delete<T = any, R = HttpResponse<T>>(url: string, config?: HttpRequestConfig): Promise<R>;
    head<T = any, R = HttpResponse<T>>(url: string, config?: HttpRequestConfig): Promise<R>;
    options<T = any, R = HttpResponse<T>>(url: string, config?: HttpRequestConfig): Promise<R>;
    post<T = any, R = HttpResponse<T>>(url: string, data?: any, config?: HttpRequestConfig): Promise<R>;
    put<T = any, R = HttpResponse<T>>(url: string, data?: any, config?: HttpRequestConfig): Promise<R>;
    patch<T = any, R = HttpResponse<T>>(url: string, data?: any, config?: HttpRequestConfig): Promise<R>;
}