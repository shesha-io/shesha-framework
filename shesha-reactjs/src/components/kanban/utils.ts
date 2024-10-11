import { useMutate } from '@/hooks';

export const useKanbanActions = () => {
  const { mutate } = useMutate<any>();

  const updateUserSettings = async (updatedSettings: any, descriminator: string) => {
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
        }
      );

      if (response?.success) {
        return response;
      }
    } catch (error) {
      console.error('Error updating user settings:', error);
    }
  };
  const fetchColumnState = async (descriminator: string) => {
    try {
      const response = await mutate(
        {
          url: '/api/services/app/Settings/GetUserValue',
          httpVerb: 'POST',
        },
        {
          name: descriminator,
          module: 'Shesha',
        }
      );

      if (response?.success && response?.result !== undefined) {
        return response;
      }
    } catch (error) {
      console.error('Error fetching column state:', error);
    }
  };
  const updateKanban = (payload: any, url: string) => {
    return mutate(
      {
        url: url,
        httpVerb: 'PUT',
      },
      payload
    );
  };

  const createKanbanItem = (payload: any, url: string) => {
    return mutate(
      {
        url: url,
        httpVerb: 'POST',
      },
      payload
    );
 
  };

  const deleteKanban = (payload: any, url: string) => {
    mutate({
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

    return Promise;
  };
  return { updateKanban, deleteKanban, createKanbanItem, fetchColumnState, updateUserSettings };
};
