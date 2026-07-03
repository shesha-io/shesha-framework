import { extractAjaxResponse, IAjaxResponse, IAnyObject } from '@/interfaces';
import { useHttpClient } from '@/providers';
import { ITableRowData } from '@/providers/dataTable/interfaces';
import { buildUrl } from '@/utils';

export type KanbanActions = {
  updateKanban: (payload: ITableRowData, url: string) => Promise<ITableRowData>;
  deleteKanban: (payload: string, url: string) => Promise<void>;
  createKanbanItem: (payload: ITableRowData, url: string) => Promise<ITableRowData>;
  fetchColumnState: (descriminator: string) => Promise<IAnyObject>;
  updateUserSettings: (updatedSettings: unknown, descriminator: string) => Promise<void>;
};

export const useKanbanActions = (): KanbanActions => {
  const httpClient = useHttpClient();

  const updateUserSettings = async (updatedSettings: unknown, descriminator: string): Promise<void> => {
    const response = await httpClient.post<IAjaxResponse<void>>(
      '/api/services/app/Settings/UpdateUserValue',
      {
        name: descriminator,
        module: 'Shesha',
        value: JSON.stringify(updatedSettings),
        datatype: 'string',
      },
    );
    extractAjaxResponse(response.data);
  };
  const fetchColumnState = async (descriminator: string): Promise<IAnyObject> => {
    const response = await httpClient.post<IAjaxResponse<IAnyObject>>('/api/services/app/Settings/GetUserValue', {
      name: descriminator,
      module: 'Shesha',
    });
    const responseData = extractAjaxResponse(response.data);
    return responseData;
  };
  const updateKanban = async (payload: ITableRowData, url: string): Promise<ITableRowData> => {
    const response = await httpClient.put<IAjaxResponse<ITableRowData>>(url, payload);
    const responseData = extractAjaxResponse(response.data);
    return responseData;
  };

  const createKanbanItem = async (payload: ITableRowData, url: string): Promise<ITableRowData> => {
    const response = await httpClient.post<IAjaxResponse<ITableRowData>>(url, payload);
    const responseData = extractAjaxResponse(response.data);
    return responseData;
  };

  const deleteKanban = async (payload: string, url: string): Promise<void> => {
    const finalUrl = buildUrl(url, { id: payload });
    const response = await httpClient.delete<IAjaxResponse<void>>(finalUrl);
    extractAjaxResponse(response.data);
  };
  return { updateKanban, deleteKanban, createKanbanItem, fetchColumnState, updateUserSettings };
};
