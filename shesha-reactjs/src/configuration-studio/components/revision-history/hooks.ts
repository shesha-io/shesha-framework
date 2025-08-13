import { CS_URLS } from "@/configuration-studio/apis";
import { IAjaxResponse } from "@/interfaces";
import { useHttpClient } from "@/providers";
import { useCallback } from "react";
import useSWR from "swr";


export type ConfigurationItemRevision = {
    label?: string;
    description?: string;
    versionNo: number;
    versionName?: string;
    comments?: string;
    configHash: string;
    isCompressed: boolean;
    
    creationTime: string;
    creatorUserId?: number;
    creatorUserName?: string;
};

export type GetItemRevisionsResponse = {
    revisions: ConfigurationItemRevision[];
};

export const useItemRevisionHistory = (itemId: string) => {
    const httpClient = useHttpClient();

    const fetcher = useCallback((url: string) => {
        return httpClient.get<IAjaxResponse<GetItemRevisionsResponse>>(url).then(res => {
            const result = res.data.result;

            return result;
        });
    }, [httpClient]);

    const url = `${CS_URLS.GET_ITEM_REVISION_HISTORY}?itemId=${itemId}`;
    return useSWR(url, fetcher, { refreshInterval: 0, revalidateOnFocus: false });
};