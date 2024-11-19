import axios, { AxiosError } from "axios";
import { HttpResponse } from "@/publicJsApis/httpClient";

export const unwrapAxiosError = (error: any) => {
    const axiosError = axios.isAxiosError(error) ? error as AxiosError: undefined;

    throw axiosError && axiosError.response
        ? axiosError.response 
        : error;
};

export const unwrapAxiosCall = <Response = any>(promise: Promise<HttpResponse<Response>>) => {
    return promise.then(response => response.data).catch(unwrapAxiosError);
};