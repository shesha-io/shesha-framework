import { CS_URLS } from "@/configuration-studio/apis";
import { IAjaxResponse } from "@/interfaces";
import { isAjaxSuccessResponse } from "@/interfaces/ajaxResponse";
import { useHttpClient } from "@/providers";
import { useCallback } from "react";
import useSWR, { SWRResponse } from "swr";

export type ConfigurationItemRevision = {
  label?: string | null;
  description?: string | null;
  versionNo: number;
  versionName?: string | null;
  comments?: string | null;
  configHash: string | null;
  isCompressed: boolean;

  creationTime: string;
  creatorUserId?: number;
  creatorUserName?: string | null;
};

export type GetItemRevisionsResponse = {
  revisions: ConfigurationItemRevision[];
};

export const useItemRevisionHistory = (itemId: string): SWRResponse<GetItemRevisionsResponse, Error> => {
  const httpClient = useHttpClient();

  const fetcher = useCallback((url: string) => {
    return httpClient.get<IAjaxResponse<GetItemRevisionsResponse>>(url).then((res) => {
      const result = isAjaxSuccessResponse(res.data)
        ? res.data.result
        : { revisions: [] };

      return result;
    });
  }, [httpClient]);

  const url = `${CS_URLS.GET_ITEM_REVISION_HISTORY}?itemId=${itemId}`;
  return useSWR<GetItemRevisionsResponse, Error>(url, fetcher, { refreshInterval: 0, revalidateOnFocus: false });
};
