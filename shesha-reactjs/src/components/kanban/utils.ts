import { extractAjaxResponse, IAjaxResponse } from '@/interfaces';
import { useHttpClient } from '@/providers';
import { ITableRowData } from '@/providers/dataTable/interfaces';
import { buildUrl } from '@/utils';
import { isDefined } from '@/utils/nullables';
import { jsonSafeParse } from '@/utils/object';

/** Collapsed state of every Kanban column, keyed by column item value. */
export type KanbanColumnState = Record<string, boolean>;

type GetUserSettingValueRequest = {
  name: string;
  module: string;
};

type UpdateUserSettingValueRequest = {
  name: string;
  module: string;
  value: string;
  datatype: string;
};

/** GetUserValue returns the value as stored - the JSON string written below - or null when nothing is saved yet. */
type UserSettingValue = string | KanbanColumnState | null;

export type KanbanActions = {
  updateKanban: (payload: ITableRowData, url: string) => Promise<ITableRowData>;
  deleteKanban: (payload: string, url: string) => Promise<void>;
  createKanbanItem: (payload: ITableRowData, url: string) => Promise<ITableRowData>;
  fetchColumnState: (descriminator: string) => Promise<KanbanColumnState | null>;
  updateUserSettings: (updatedSettings: KanbanColumnState, descriminator: string) => Promise<void>;
};

export const useKanbanActions = (): KanbanActions => {
  const httpClient = useHttpClient();

  const updateUserSettings = async (updatedSettings: KanbanColumnState, descriminator: string): Promise<void> => {
    const response = await httpClient.post<IAjaxResponse<void>, UpdateUserSettingValueRequest>(
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
  const fetchColumnState = async (descriminator: string): Promise<KanbanColumnState | null> => {
    const response = await httpClient.post<IAjaxResponse<UserSettingValue>, GetUserSettingValueRequest>(
      '/api/services/app/Settings/GetUserValue',
      {
        name: descriminator,
        module: 'Shesha',
      },
    );
    const responseData = extractAjaxResponse(response.data);
    const columnState = typeof responseData === 'string'
      ? jsonSafeParse<KanbanColumnState>(responseData)
      : responseData;
    return isDefined(columnState) && typeof columnState === 'object'
      ? columnState
      : null;
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
