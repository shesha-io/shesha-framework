import axios, { AxiosError } from "axios";
import { HttpResponse } from "@/publicJsApis/httpClient";

export const unwrapAxiosCall = <Response = unknown>(promise: Promise<HttpResponse<Response>>): Promise<Response> => {
  return promise.then((response) => response.data).catch((error: unknown) => {
    const axiosError = axios.isAxiosError(error) ? error as AxiosError : undefined;
    throw axiosError && axiosError.response
      ? axiosError.response
      : error;
  });
};
