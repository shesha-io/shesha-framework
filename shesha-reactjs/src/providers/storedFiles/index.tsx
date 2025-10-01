import axios from 'axios';
import FileSaver from 'file-saver';
import { IAjaxResponse } from '@/interfaces';
import qs from 'qs';
import React, { FC, PropsWithChildren, useContext, useEffect, useReducer, useRef } from 'react';
import { useDeleteFileById } from '@/apis/storedFile';
import { useGet, useMutate } from '@/hooks';
import { IApiEndpoint } from '@/interfaces/metadata';
import { useDelayedUpdate } from '@/providers/delayedUpdateProvider';
import { STORED_FILES_DELAYED_UPDATE } from '@/providers/delayedUpdateProvider/models';
import { useSheshaApplication } from '@/providers/sheshaApplication';
import { useSignalR } from '@/providers/signalR';
import { getFlagSetters } from '../utils/flagsSetters';
import {
  deleteFileErrorAction,
  deleteFileRequestAction,
  deleteFileSuccessAction,
  downloadZipErrorAction,
  downloadZipRequestAction,
  downloadZipSuccessAction,
  fetchFileListErrorAction,
  fetchFileListSuccessAction,
  initializeFileListAction,
  onFileAddedAction,
  onFileDeletedAction,
  updateAllFilesDownloadedByCurrentUser,
  updateIsDownloadedByCurrentUser,
  uploadFileErrorAction,
  uploadFileRequestAction,
  uploadFileSuccessAction,
} from './actions';
import {
  IDownloadFilePayload,
  IDownloadZipPayload,
  IStoredFile,
  IUploadFilePayload,
  STORED_FILES_CONTEXT_INITIAL_STATE,
  StoredFilesActionsContext,
  StoredFilesStateContext,
} from './contexts';
import { storedFilesReducer } from './reducer';
import { App } from 'antd';
import { isAjaxSuccessResponse } from '@/interfaces/ajaxResponse';
import { addFile, removeFile, updateAllFilesDownloaded, updateDownloadedAFile } from './utils';
export interface IStoredFilesProviderProps {
  ownerId: string;
  ownerType: string;
  ownerName?: string;
  filesCategory?: string;
  propertyName?: string;
  baseUrl?: string;

  // used for requered field validation
  value?: IStoredFile[];
  onChange?: (fileList: IStoredFile[]) => void;
  onDownload?: (fileList: IStoredFile[]) => void;
}

const fileReducer = (data: IStoredFile): IStoredFile => {
  return { ...data, uid: data.id };
};

const filesReducer = (data: IStoredFile[]): IStoredFile[] => data?.map((file) => fileReducer(file));

const uploadFileEndpoint: IApiEndpoint = { url: '/api/StoredFile/Upload', httpVerb: 'POST' };
const filesListEndpoint: IApiEndpoint = { url: '/api/StoredFile/FilesList', httpVerb: 'GET' };

const StoredFilesProvider: FC<PropsWithChildren<IStoredFilesProviderProps>> = ({
  children,
  ownerId,
  ownerType,
  ownerName,
  filesCategory,
  propertyName,
  baseUrl,
  // used for requered field validation
  onChange,
  onDownload,
  value = [],
}) => {
  const [state, dispatch] = useReducer(storedFilesReducer, {
    ...STORED_FILES_CONTEXT_INITIAL_STATE,
  });

  // Synced ref to avoid stale closures in upload/delete/download handlers
  const fileListRef = useRef<IStoredFile[]>(state.fileList ?? []);

  // Update ref whenever state.fileList changes to maintain freshness
  useEffect(() => {
    fileListRef.current = state.fileList;
  }, [state.fileList]);

  const { message } = App.useApp();
  const { connection } = useSignalR(false) ?? {};
  const { httpHeaders: headers, backendUrl } = useSheshaApplication();
  const { addItem: addDelayedUpdate, removeItem: removeDelayedUpdate } = useDelayedUpdate(false) ?? {};

  const {
    loading: isFetchingFileList,
    refetch: fetchFileListHttp,
    data: fileListResponse,
  } = useGet<IAjaxResponse<IStoredFile[]>>({
    path: filesListEndpoint.url,
    queryParams: {
      ownerId,
      ownerType,
      ownerName,
      filesCategory,
      propertyName,
    },
    lazy: true,
  });

  const { mutate: uploadFileHttp } = useMutate();

  // Initialize fileList from value prop when component mounts or value changes
  useEffect(() => {
    if (value && value.length > 0 && (!state.fileList || state.fileList.length === 0)) {
      dispatch(initializeFileListAction(value as IStoredFile[]));
    }
  }, [value]);

  useEffect(() => {
    if ((ownerId || '') !== '' && (ownerType || '') !== '') {
      fetchFileListHttp()
        .then((resp) => {
          if (isAjaxSuccessResponse(resp)) {
            const fileList = filesReducer((resp?.result ?? []) as IStoredFile[]);
            dispatch(fetchFileListSuccessAction(fileList));
            onChange?.(fileList);
          } else {
            dispatch(fetchFileListErrorAction());
          }
        })
        .catch(() => {
          dispatch(fetchFileListErrorAction());
        });
    }
  }, [ownerId, ownerType, ownerName, filesCategory, propertyName]);

  useEffect(() => {
    if (!isFetchingFileList) {
      if (isAjaxSuccessResponse(fileListResponse)) {
        const { result } = fileListResponse;
        const fileList = filesReducer(result as IStoredFile[]);

        dispatch(fetchFileListSuccessAction(fileList));
      } else {
        dispatch(fetchFileListErrorAction());
      }
    }
  }, [isFetchingFileList, fileListResponse]);

  //#region Register signal r events
  useEffect(() => {
    connection?.on('OnFileAdded', (eventData: IStoredFile | string) => {
      const patient = typeof eventData === 'object' ? eventData : (JSON.parse(eventData) as IStoredFile);

      dispatch(onFileAddedAction(patient));
      const next = [...(fileListRef.current ?? []).filter((f) => f.id !== patient?.id), fileReducer(patient)];
      onChange?.(next);
    });

    connection?.on('OnFileDeleted', (eventData: IStoredFile | string) => {
      const patient = typeof eventData === 'object' ? eventData : (JSON.parse(eventData) as IStoredFile);

      dispatch(onFileDeletedAction(patient?.id));
      onChange?.(fileListRef.current?.filter((file) => file.id !== patient?.id) || []);
    });
    return () => {
      connection?.off('OnFileAdded');
      connection?.off('OnFileDeleted');
    };
  }, []);
  //#endregion

  const uploadFile = (payload: IUploadFilePayload) => {
    const formData = new FormData();

    const { file } = payload;

    formData.append('ownerId', payload.ownerId || ownerId);
    formData.append('ownerType', payload.ownerType || ownerType);
    formData.append('ownerName', payload.ownerName || ownerName);
    formData.append('file', file);
    if (filesCategory)
      formData.append('filesCategory', `${filesCategory}`);
    formData.append('propertyName', '');

    const tempUid = (file as any)?.uid ?? Math.random().toString(36).slice(2);
    const newFile: IStoredFile = { uid: tempUid, ...(file as any), status: 'uploading', name: file.name };

    if (!Boolean(payload.ownerId || ownerId) && typeof addDelayedUpdate !== 'function') {
      console.error('File list component is not configured');
      dispatch(
        uploadFileErrorAction({
          ...newFile,
          uid: '-1',
          status: 'error',
          error: 'File list component is not configured',
        })
      );
      return;
    }

    dispatch(uploadFileRequestAction(newFile));

    uploadFileHttp(uploadFileEndpoint, formData)
      .then((response) => {
        const responseFile = response.result as IStoredFile;
        responseFile.uid = newFile.uid;
        dispatch(uploadFileSuccessAction({ ...responseFile }));
        onChange?.(addFile(responseFile, fileListRef.current));

        if (responseFile.temporary && typeof addDelayedUpdate === 'function')
          addDelayedUpdate(STORED_FILES_DELAYED_UPDATE, responseFile.id, {
            ownerName: payload.ownerName || ownerName,
          });
      })
      .catch((e) => {
        message.error(`File upload failed. Probably file size is too big`);
        console.error(e);
        dispatch(uploadFileErrorAction({ ...newFile, status: 'error' }));
      });
  };

  const { mutate: deleteFileHttp } = useDeleteFileById();

  //#region delete file

  const deleteFileSuccess = (fileIdToDelete: string) => {
    dispatch(deleteFileSuccessAction(fileIdToDelete));
  };

  const deleteFileError = (fileIdToDelete: string) => {
    dispatch(deleteFileErrorAction(fileIdToDelete));
  };

  const deleteFile = (fileIdToDelete: string) => {
    dispatch(deleteFileRequestAction(fileIdToDelete));

    deleteFileHttp({ id: fileIdToDelete })
      .then(() => {
        deleteFileSuccess(fileIdToDelete);
        const updateList = removeFile(fileIdToDelete, fileListRef.current ?? []);
        onChange?.(updateList);
        if (typeof removeDelayedUpdate === 'function') {
          removeDelayedUpdate(STORED_FILES_DELAYED_UPDATE, fileIdToDelete);
        }
      })
      .catch(() => deleteFileError(fileIdToDelete));
  };

  //#endregion

  const downloadZipFile = (payload: IDownloadZipPayload = null) => {
    dispatch(downloadZipRequestAction());
    const query = !!payload
      ? payload
      : !!ownerId
        ? {
          ownerId: ownerId,
          ownerType: ownerType,
          filesCategory: filesCategory,
          ownerName: ownerName,
        }
        : {
          filesId: fileListRef.current?.map((x) => x.id).filter((x) => !!x),
        };
    axios({
      url: `${baseUrl ?? backendUrl}/api/StoredFile/DownloadZip?${qs.stringify(query)}`,
      method: 'GET',
      responseType: 'blob',
      headers,
    })
      .then((response) => {
        dispatch(downloadZipSuccessAction());
        FileSaver.saveAs(new Blob([response.data]), `Files.zip`);
        dispatch(updateAllFilesDownloadedByCurrentUser());
        const updatedList = updateAllFilesDownloaded(fileListRef.current ?? []);
        onDownload?.(updatedList);
      })
      .catch(() => {
        dispatch(downloadZipErrorAction());
      });
  };

  const downloadFile = (payload: IDownloadFilePayload) => {
    const url = `${(baseUrl ?? backendUrl)}/api/StoredFile/Download?${qs.stringify({
      id: payload.fileId,
    })}`;
    axios({
      url,
      method: 'GET',
      responseType: 'blob',
      headers,
    })
      .then((response) => {
        FileSaver.saveAs(new Blob([response.data]), payload.fileName);
        dispatch(updateIsDownloadedByCurrentUser(payload.fileId));
        const nextList = updateDownloadedAFile(fileListRef.current ?? [], payload.fileId);
        onDownload?.(nextList);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  return (
    <StoredFilesStateContext.Provider value={state}>
      <StoredFilesActionsContext.Provider
        value={{
          ...getFlagSetters(dispatch),
          uploadFile,
          deleteFile,
          downloadZipFile,
          downloadFile, /* NEW_ACTION_GOES_HERE */
        }}
      >
        {children}
      </StoredFilesActionsContext.Provider>
    </StoredFilesStateContext.Provider>
  );
};

function useStoredFilesState() {
  const context = useContext(StoredFilesStateContext);

  if (context === undefined) {
    throw new Error('useStoredFilesState must be used within a StoredFilesProvider');
  }

  return context;
}

function useStoredFilesActions() {
  const context = useContext(StoredFilesActionsContext);

  if (context === undefined) {
    throw new Error('useStoredFilesActions must be used within a StoredFilesProvider');
  }

  return context;
}

function useStoredFilesStore() {
  return { ...useStoredFilesState(), ...useStoredFilesActions() };
}

export default StoredFilesProvider;

/**
 * @deprecated - use useStoredFilesStore
 */
const useStoredFiles = useStoredFilesStore;

export { StoredFilesProvider, useStoredFiles, useStoredFilesActions, useStoredFilesState, useStoredFilesStore };
