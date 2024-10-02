import { useMutate } from "@/hooks";
import { toSizeCssProp } from "@/utils/form";
import { CSSProperties } from "react";

export const addPx = (value: any) => {
    return !value ? null : /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
};

export const getColumns = (endpoint: string, refListName: string) => {
    let queryParams = {
        entityType: 'Shesha.Framework.ReferenceListItem',
        filter: '{"and":[{"==":[{"var":"referenceList.isLast"},true]}]}',
        quickSearch: refListName
    };
    return {
      path: endpoint,
      queryParams: queryParams,
    };
};

export const getMetaData = (endpoint: string, entityType: string) => {
  let queryParams = {
      container: entityType
  };
  return {
    path: endpoint,
    queryParams
  };
};


export const useKanbanActions = () => {
  const { mutate } = useMutate<any>();

  const updateKanban = (payload: any, url: string) => {
    mutate(
      {
        url: url,
        httpVerb: 'PUT',
      },
      payload
    )
      .then((resp: any) => {
        if (resp.success) {
          return resp;
        }
      })
      .catch((error: any) => {
        console.error(error);
      });
  };

  const createKanbanItem = (payload: any, url: string) => {
    mutate(
      {
        url: url,
        httpVerb: 'POST',
      },
      payload
    )
      .then((resp: any) => {
        if (resp.success) {
          return resp;
        }
      })
      .catch((error: any) => {
        console.error(error);
      });
  };

  const deleteKanban = (payload: any, url: string) => {
    mutate(
      {
        url: `${url}?id=${payload}`,
        httpVerb: 'DELETE',
      }
    )
      .then((resp: any) => {
        if (resp.success) {
          return resp;
        }
      })
      .catch((error: any) => {
        console.error(error);
      });

      return Promise;
  };
  return { updateKanban, deleteKanban, createKanbanItem };
};

export const getHeight = (height: string | number, minHeight: string | number, maxHeight: string | number) => {
  const heightStyles: CSSProperties = {
    height: toSizeCssProp(height),
    minHeight: toSizeCssProp(minHeight),
    maxHeight: toSizeCssProp(maxHeight),
  };
  
  return heightStyles;
};
