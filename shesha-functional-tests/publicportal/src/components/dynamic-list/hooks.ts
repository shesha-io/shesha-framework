import { extractAjaxResponse, GetAllResponse, IAjaxResponse, useHttpClient } from "@shesha-io/reactjs";
import useSWR, { SWRResponse } from 'swr';
import { URLS } from "./fetchers";
import { Organisations } from "./models";

export const useOrganisationalAccounts = (): SWRResponse<Organisations[], Error> => {
  const httpClient = useHttpClient();

  const fetcher = (): Promise<Organisations[]> => {
    return httpClient.get<IAjaxResponse<GetAllResponse<Organisations>>>(URLS.GET_ORGANISATIONS).then((response) => {
      const responseData = extractAjaxResponse(response.data);
      return responseData.items;
    });
  };

  return useSWR([URLS.GET_ORGANISATIONS, httpClient], fetcher, { refreshInterval: 0, revalidateOnFocus: false });
};
