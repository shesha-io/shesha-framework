import { CS_URLS } from "@/configuration-studio/apis";
import { IAjaxResponse } from "@/interfaces";
import { isAjaxSuccessResponse } from "@/interfaces/ajaxResponse";
import { useHttpClient } from "@/providers";
import { useCallback } from "react";
import useSWR, { SWRResponse } from "swr";

export enum CreationMethod {
  Manual = 1,
  ManualImport = 2,
  MigrationImport = 3,
}

export type ConfigurationItemRevision = {
  id: string;
  label: string | null;
  description: string | null;
  versionNo: number;
  versionName: string | null;
  comments: string | null;
  configHash: string | null;
  isCompressed: boolean;

  isEditable: boolean;
  moduleName: string;
  dllVersionNo: string | null;

  creationMethod: CreationMethod;
  creationTime: string;
  creatorUserId: number;
  creatorUserName: string | null;
};

export type GetItemRevisionsResponse = {
  revisions: ConfigurationItemRevision[];
};

export type ItemRevision = ConfigurationItemRevision & {
  itemType: 'revision';
};

export type ItemRevisionsSubheading = {
  itemType: 'subheading';
  label: string;
};

export type ItemRevisionOrSubheading = ItemRevision | ItemRevisionsSubheading;

export type ItemRevisionsWithSubheadings = {
  items: ItemRevisionOrSubheading[];
};

const responseToItemRevisions = (response: GetItemRevisionsResponse): ItemRevisionsWithSubheadings => {
  const { revisions } = response;
  const items: ItemRevisionOrSubheading[] = [];
  revisions.forEach((revision, index) => {
    if (index > 0 && revisions[index - 1]?.moduleName !== revision.moduleName)
      items.push({ itemType: 'subheading', label: revision.moduleName });

    items.push({ ...revision, itemType: 'revision' });
  });
  return {
    items: items,
  };
};

export const useItemRevisionHistory = (itemId: string): SWRResponse<ItemRevisionsWithSubheadings, Error> => {
  const httpClient = useHttpClient();

  const fetcher = useCallback((url: string) => {
    return httpClient.get<IAjaxResponse<GetItemRevisionsResponse>>(url).then((res) => {
      const result = isAjaxSuccessResponse(res.data)
        ? res.data.result
        : { revisions: [] };

      return responseToItemRevisions(result);
    });
  }, [httpClient]);

  const url = `${CS_URLS.GET_ITEM_REVISION_HISTORY}?itemId=${itemId}`;
  return useSWR<ItemRevisionsWithSubheadings, Error>(url, fetcher, { refreshInterval: 0, revalidateOnFocus: false });
};
