import axios, { AxiosError } from 'axios';
import { useState } from 'react';
import { IApiEndpoint } from '@/interfaces/metadata';
import { useSheshaApplication } from '@/providers';

type MutateHttpVerb = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface IMutateState {
  loading: boolean;
  error: any;
}

export interface IUseMutateResponse<TData = any, TResponse = any> extends IMutateState {
  mutate: (endpoint: IApiEndpoint, data?: TData) => Promise<TResponse>;
}

const ENDPOINT_NOT_SPECIFIED_ERROR = 'Endpoint is not specified';

export const useMutate = <TData = any, TResponse = any>(): IUseMutateResponse<TData, TResponse> => {
  const { backendUrl, httpHeaders } = useSheshaApplication();
  const [state, setState] = useState<IMutateState>({ error: null, loading: false });

  const mutate = (endpoint: IApiEndpoint, data?: TData): Promise<TResponse> => {
    if (!endpoint) {
      setState((prev) => ({ ...prev, loading: false, error: ENDPOINT_NOT_SPECIFIED_ERROR }));
      return Promise.reject(ENDPOINT_NOT_SPECIFIED_ERROR);
    }

    setState((prev) => ({ ...prev, loading: true }));

    return new Promise<TResponse>((resolve, reject) => {
      axios({
        baseURL: backendUrl,
        url: endpoint.url,
        method: endpoint.httpVerb?.toUpperCase() as MutateHttpVerb,
        headers: httpHeaders,
        data: data,
      })
        .then((data) => {
          setState((prev) => ({ ...prev, loading: false, error: null }));

          resolve(data?.data);
        })
        .catch((error) => {
          const axiosResponse = axios.isAxiosError(error) ? (error as AxiosError).response : null;

          setState((prev) => ({ ...prev, loading: false, error: axiosResponse ?? error }));
          reject(axiosResponse ?? error);
        })
        .finally(() => {
          setState((prev) => ({ ...prev, loading: false }));
        });
    });
  };

  return {
    ...state,
    mutate,
  };
};

export interface IUseMutateResponseFixedEndpoint<TData = any, TResponse = any> extends IMutateState {
  mutate: (data?: TData) => Promise<TResponse>;
}

export interface IApiEndpointWithPathParams<TData> {
  /**
   * Http verb (get/post/put etc)
   */
  httpVerb: string;
  /**
   * Url
   */
  url: string | ((data: TData) => string);
}

export const useMutateForEndpoint = <TData = any, TResponse = any>(
  endpoint: IApiEndpointWithPathParams<TData>,
): IUseMutateResponseFixedEndpoint<TData, TResponse> => {
  const response = useMutate<TData, TResponse>();

  const mutate = (data?: TData): Promise<TResponse> => {
    const url = typeof endpoint.url === 'string' ? endpoint.url : endpoint.url(data);
    return response.mutate({ url, httpVerb: endpoint.httpVerb }, data);
  };

  return { ...response, mutate };
};
