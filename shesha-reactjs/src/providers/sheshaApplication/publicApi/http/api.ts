// /**
//  * Simplified HTTP response
//  */
// export interface HttpResponse<T = any> {
//     data: T;
//     status: number;
//     statusText: string;
//     headers: any;
//     request?: any;
// }

// /**
//  * Simplified HTTP client API
//  */
// export interface HttpClientApi {
//     get<T = any, R = HttpResponse<T>>(url: string, headers?: Record<string, string>): Promise<R>;
//     delete<T = any, R = HttpResponse<T>>(url: string): Promise<R>;
//     head<T = any, R = HttpResponse<T>>(url: string): Promise<R>;
//     options<T = any, R = HttpResponse<T>>(url: string): Promise<R>;
//     post<T = any, R = HttpResponse<T>>(url: string, data?: any): Promise<R>;
//     put<T = any, R = HttpResponse<T>>(url: string, data?: any): Promise<R>;
//     patch<T = any, R = HttpResponse<T>>(url: string, data?: any): Promise<R>;
// }
