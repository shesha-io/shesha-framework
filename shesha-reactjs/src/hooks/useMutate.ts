import axios, { AxiosError } from 'axios';
import { useState } from 'react';
import { IApiEndpoint } from '@/interfaces/metadata';
import { useSheshaApplication } from '@/providers';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

type MutateHttpVerb = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface IMutateState {
  loading: boolean;
  error: unknown;
}

export interface IUseMutateResponse<TData = unknown, TResponse = unknown> extends IMutateState {
  mutate: (endpoint: IApiEndpoint, data?: TData) => Promise<TResponse>;
}

const ENDPOINT_NOT_SPECIFIED_ERROR = 'Endpoint is not specified';

export const useMutate = <TData = unknown, TResponse = unknown>(): IUseMutateResponse<TData, TResponse> => {
  const { backendUrl, httpHeaders } = useSheshaApplication();
  const [state, setState] = useState<IMutateState>({ error: null, loading: false });

  const mutate = (endpoint: IApiEndpoint, data?: TData): Promise<TResponse> => {
    if (!isDefined(endpoint)) {
      setState((prev) => ({ ...prev, loading: false, error: ENDPOINT_NOT_SPECIFIED_ERROR }));
      return Promise.reject(ENDPOINT_NOT_SPECIFIED_ERROR);
    }

    setState((prev) => ({ ...prev, loading: true }));

    if (isNullOrWhiteSpace(endpoint.httpVerb))
      throw new Error("Http verb is not specified for endpoint: " + endpoint.url);

    return new Promise<TResponse>((resolve, reject) => {
      axios({
        baseURL: backendUrl,
        url: endpoint.url,
        method: endpoint.httpVerb.toUpperCase() as MutateHttpVerb,
        headers: httpHeaders,
        data: data,
      })
        .then((data) => {
          setState((prev) => ({ ...prev, loading: false, error: null }));

          resolve(data.data as TResponse);
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

export interface IUseMutateResponseFixedEndpoint<TData = unknown, TResponse = unknown> extends IMutateState {
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
  url: string | ((data?: TData) => string);
}

export const useMutateForEndpoint = <TData = unknown, TResponse = unknown>(
  endpoint: IApiEndpointWithPathParams<TData>,
): IUseMutateResponseFixedEndpoint<TData, TResponse> => {
  const response = useMutate<TData, TResponse>();

  const mutate = (data?: TData): Promise<TResponse> => {
    const url = typeof endpoint.url === 'string' ? endpoint.url : endpoint.url(data);
    return response.mutate({ url, httpVerb: endpoint.httpVerb }, data);
  };

  return { ...response, mutate };
};
