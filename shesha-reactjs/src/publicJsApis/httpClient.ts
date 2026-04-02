/**
 * HTTP response
 */
export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  request?: unknown;
}

export type ResponseType =
  | 'arraybuffer' |
  'blob' |
  'document' |
  'json' |
  'text' |
  'stream' |
  'formdata';

/**
 * Http request configuration
 */
export interface HttpRequestConfig {
  /** Request headers */
  headers?: Record<string, string>;
  /** If true, standard headers will be omitted */
  omitStandardHeaders?: boolean;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Response type */
  responseType?: ResponseType;
  /** Abort signal */
  signal?: AbortSignal;
}

/**
 * HTTP client API
 */
export interface HttpClientApi {
  get<T = unknown, R = HttpResponse<T>>(url: string, config?: HttpRequestConfig): Promise<R>;
  delete<T = unknown, R = HttpResponse<T>>(url: string, config?: HttpRequestConfig): Promise<R>;
  head<T = unknown, R = HttpResponse<T>>(url: string, config?: HttpRequestConfig): Promise<R>;
  options<T = unknown, R = HttpResponse<T>>(url: string, config?: HttpRequestConfig): Promise<R>;
  post<T = unknown, R = HttpResponse<T>, D = unknown>(url: string, data?: D, config?: HttpRequestConfig): Promise<R>;
  put<T = unknown, R = HttpResponse<T>, D = unknown>(url: string, data?: D, config?: HttpRequestConfig): Promise<R>;
  patch<T = unknown, R = HttpResponse<T>, D = unknown>(url: string, data?: D, config?: HttpRequestConfig): Promise<R>;
}
