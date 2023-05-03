import axios, { AxiosError } from 'axios';
import { IApiEndpoint } from 'interfaces/metadata';
import { useState } from 'react';
import { useSheshaApplication } from '../providers';

type MutateHttpVerb = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface IMutateState {
    loading: boolean;
    error: any;
}

export interface IUseMutateResponse<TData = any> extends IMutateState {
    mutate: (endpoint: IApiEndpoint, data?: TData) => Promise<TData>;
}

const ENDPOINT_NOT_SPECIFIED_ERROR = 'Endpoint is not specified';

export const useMutate = <TData = any>(): IUseMutateResponse<TData> => {
    const { backendUrl, httpHeaders } = useSheshaApplication();
    const [state, setState] = useState<IMutateState>({ error: null, loading: false });

    const mutate = (endpoint: IApiEndpoint, data?: TData) => {
        if (!endpoint) {
            setState(prev => ({ ...prev, loading: false, error: ENDPOINT_NOT_SPECIFIED_ERROR }));
            return Promise.reject(ENDPOINT_NOT_SPECIFIED_ERROR);
        }

        setState(prev => ({ ...prev, loading: true }));

        return new Promise<TData>((resolve, reject) => {
            axios({
                baseURL: backendUrl,
                url: endpoint.url,
                method: endpoint.httpVerb?.toUpperCase() as MutateHttpVerb,
                headers: httpHeaders,
                data: data,
            })
                .then(data => {
                    setState(prev => ({ ...prev, loading: false, error: null }));

                    resolve(data?.data);
                })
                .catch(error => {
                    const axiosResponse = axios.isAxiosError(error)
                        ? (error as AxiosError).response
                        : null;

                    setState(prev => ({ ...prev, loading: false, error: axiosResponse ?? error }));
                    reject(axiosResponse ?? error);
                })
                .finally(() => {
                    setState(prev => ({ ...prev, loading: false }));
                });
        });
    };

    return {
        ...state,
        mutate,
    };
};