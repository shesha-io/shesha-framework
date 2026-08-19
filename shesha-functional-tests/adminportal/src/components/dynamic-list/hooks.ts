import { extractAjaxResponse, GetAllResponse, IAjaxResponse, useHttpClient } from "@shesha-io/reactjs";
import useSWR, { SWRResponse } from 'swr';
import { URLS } from "./fetchers";
import { Organisations } from "./models";

/**
 * Dynamic data result
 */
export interface IDynamicDataResult {
  [key: string]: unknown;
}

export const useOrganisationalAccounts = (): SWRResponse<Organisations[], Error> => {
  const httpClient = useHttpClient();

  const fetcher = (): Promise<Organisations[]> => {
    return httpClient.get<IAjaxResponse<GetAllResponse<Organisations>>>(URLS.GET_ORGANISATIONS).then((res) => {
      const result = extractAjaxResponse(res.data);

      return result.items;
    });
  };

  return useSWR([URLS.GET_ORGANISATIONS, httpClient], fetcher, { refreshInterval: 0, revalidateOnFocus: false });
};
