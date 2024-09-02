import { IAjaxResponse, useHttpClient } from "@shesha-io/reactjs";
import useSWR from 'swr';
import { URLS } from "./fetchers";
import { Organisations } from "./models";

/**
 * Dynamic data result
 */
export interface IDynamicDataResult {
    [key: string]: any;
  }

export const useOrganisationalAccounts = () => {
    const httpClient = useHttpClient();

    const fetcher = () => {
        return httpClient.get<IDynamicDataResult>(URLS.GET_ORGANISATIONS).then(res => {
            const result = res.data.result.items;

            return result as Organisations [];
        });
    };

    return useSWR([URLS.GET_ORGANISATIONS, httpClient], fetcher, { refreshInterval: 0, revalidateOnFocus: false });
};