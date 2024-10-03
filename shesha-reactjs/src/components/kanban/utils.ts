import { useMutate } from "@/hooks";

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

  const fetchColumnState = async () => {
    try {
      const response = await mutate({
        url: '/api/services/app/Settings/GetUserValue',
        httpVerb: 'POST',
      }, {
        name: `mSettings`,
        module: 'Shesha',
      });
  
      if (response?.success && response?.result !== undefined) {
        return response;
      }
    } catch (error) {
      console.error('Error fetching column state:', error);
    }
  };
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
  return { updateKanban, deleteKanban, createKanbanItem, fetchColumnState };
};

