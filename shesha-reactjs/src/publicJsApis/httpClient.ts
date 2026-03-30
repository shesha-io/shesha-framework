/**
 * HTTP response
 */
export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  request?: any;
}

export type ResponseType =
  | 'arraybuffer' |
  'blob' |
  'document' |
  'json' |
  'text' |
  'stream' |
  'formdata';

export interface GenericAbortSignal {
  readonly aborted: boolean;
  onabort?: ((...args: any) => any) | null;
  addEventListener?: (...args: any) => any;
  removeEventListener?: (...args: any) => any;
}

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
  signal?: GenericAbortSignal;
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
