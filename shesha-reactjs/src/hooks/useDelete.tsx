import axios, { AxiosRequestConfig } from 'axios';
import { useState } from 'react';
import { useSheshaApplication } from '../providers';

interface IDeleteState {
  loading?: boolean;
  error: any;
  mutate?: any;
}

export const useDelete = () => {
  const { backendUrl, httpHeaders } = useSheshaApplication();
  const [state, setState] = useState<IDeleteState>();

  const mutate = (url: string, config?: AxiosRequestConfig) => {
    setState(prev => ({ ...prev, loading: true }));

    return new Promise((resolve, reject) => {
      axios({
        baseURL: backendUrl,
        url: url,
        method: 'DELETE',
        headers: httpHeaders,
        ...config,
      })
        .then(data => {
          setState(prev => ({ ...prev, loading: false, error: null }));

          resolve(data?.data);
        })
        .catch(error => {
          setState(prev => ({ ...prev, loading: false, error: error }));
          reject();
        })
        .finally(() => {
          setState(prev => ({ ...prev, loading: false }));
        });
    });
  };

  return {
    mutate,
    ...state,
  };
};
