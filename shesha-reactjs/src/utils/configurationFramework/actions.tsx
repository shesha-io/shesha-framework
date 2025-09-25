import FileSaver from 'file-saver';
import React, { FC } from 'react';
import { getFileNameFromResponse } from '@/utils/fetchers';
import { IErrorInfo } from '@/interfaces/errorInfo';
import { HttpClientApi } from '@/providers';

//#region validation

interface IErrorDetailsProps {
  error: IErrorInfo;
  showDetails?: boolean;
}
export const ErrorDetails: FC<IErrorDetailsProps> = ({ error, showDetails = false }) => {
  return (
    <div>
      {showDetails && error.details && <p>{error.details}</p>}
      <ul>{error.validationErrors?.map((e, i) => <li key={i}>{e.message}</li>)}</ul>
    </div>
  );
};

//#endregion

export interface ItemWithIdPayload {
  id: string;
}

interface IHasHttpClient {
  httpClient: HttpClientApi;
}

export interface IHasConfigurableItemId {
  itemId: string;
}

//#region Download as JSON
export interface IDownloadItemAsJsonPayload extends IHasHttpClient {
  id: string;
}
export interface IDownloadItemAsJsonResponse {
  id: string;
}
export const downloadAsJson = ({ httpClient, id }: IDownloadItemAsJsonPayload): Promise<IDownloadItemAsJsonResponse> => {
  const url = `/api/services/Shesha/FormConfiguration/GetJson?id=${id}`;
  return httpClient
    .get(url, { responseType: 'blob' })
    .then((response) => {
      const fileName = getFileNameFromResponse(response) ?? 'form.json';
      FileSaver.saveAs(new Blob([response.data]), fileName);
      return { id: id };
    });
};

//#endregion
