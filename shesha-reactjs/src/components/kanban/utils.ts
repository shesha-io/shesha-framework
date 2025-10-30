import { useMutate } from '@/hooks';
import { IAjaxResponse } from '@/interfaces';

export type KanbanActions = {
  updateKanban: (payload: any, url: string) => Promise<any>;
  deleteKanban: (payload: any, url: string) => Promise<any>;
  createKanbanItem: (payload: any, url: string) => Promise<any>;
  fetchColumnState: (descriminator: string) => Promise<any>;
  updateUserSettings: (updatedSettings: any, descriminator: string) => Promise<any>;
};

export const useKanbanActions = (): KanbanActions => {
  const { mutate } = useMutate<any, IAjaxResponse<any>>();

  const updateUserSettings = async (updatedSettings: any, descriminator: string): Promise<any> => {
    try {
      const response = await mutate(
        {
          url: '/api/services/app/Settings/UpdateUserValue',
          httpVerb: 'POST',
        },
        {
          name: descriminator,
          module: 'Shesha',
          value: JSON.stringify(updatedSettings),
          datatype: 'string',
        },
      );

      if (response?.success) {
        return response;
      }
    } catch (error) {
      console.error('Error updating user settings:', error);
    }
  };
  const fetchColumnState = async (descriminator: string): Promise<any> => {
    try {
      const response = await mutate(
        {
          url: '/api/services/app/Settings/GetUserValue',
          httpVerb: 'POST',
        },
        {
          name: descriminator,
          module: 'Shesha',
        },
      );

      if (response?.success && response?.result !== undefined) {
        return response;
      }
    } catch (error) {
      console.error('Error fetching column state:', error);
    }
  };
  const updateKanban = (payload: any, url: string): Promise<any> => {
    return mutate(
      {
        url: url,
        httpVerb: 'PUT',
      },
      payload,
    );
  };

  const createKanbanItem = (payload: any, url: string): Promise<any> => {
    return mutate(
      {
        url: url,
        httpVerb: 'POST',
      },
      payload,
    );
  };

  const deleteKanban = (payload: any, url: string): Promise<any> => {
    return mutate({
      url: `${url}?id=${payload}`,
      httpVerb: 'DELETE',
    })
      .then((resp: any) => {
        if (resp.success) {
          return resp;
        }
      })
      .catch((error: any) => {
        console.error(error);
      });
  };
  return { updateKanban, deleteKanban, createKanbanItem, fetchColumnState, updateUserSettings };
};
