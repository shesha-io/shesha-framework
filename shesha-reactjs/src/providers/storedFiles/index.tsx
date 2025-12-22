import axios from 'axios';
import FileSaver from 'file-saver';
import { DataTypes, IAjaxResponse } from '@/interfaces';
import qs from 'qs';
import React, { FC, PropsWithChildren, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { useDeleteFileById } from '@/apis/storedFile';
import { useGet, useMutate } from '@/hooks';
import { IApiEndpoint, IObjectMetadata } from '@/interfaces/metadata';
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
  replaceFileErrorAction,
  replaceFileRequestAction,
  replaceFileSuccessAction,
  updateAllFilesDownloadedByCurrentUser,
  updateIsDownloadedByCurrentUser,
  uploadFileErrorAction,
  uploadFileRequestAction,
  uploadFileSuccessAction,
} from './actions';
import {
  IDownloadFilePayload,
  IDownloadZipPayload,
  IReplaceFilePayload,
  IStoredFile,
  IStoredFilesActionsContext,
  IStoredFilesStateContext,
  IUploadFilePayload,
  STORED_FILES_CONTEXT_INITIAL_STATE,
  StoredFilesActionsContext,
  StoredFilesStateContext,
} from './contexts';
import { storedFilesReducer } from './reducer';
import { App } from 'antd';
import { extractAjaxResponse, isAjaxSuccessResponse } from '@/interfaces/ajaxResponse';
import { addFile, normalizeFileName, removeFile, updateAllFilesDownloaded, updateDownloadedAFile } from './utils';
import DataContextBinder from '../dataContextProvider/dataContextBinder';
import { fileListContextCode } from '@/publicJsApis';
import ConditionalWrap from '@/components/conditionalWrapper';
import { IEntityTypeIdentifier } from '../sheshaApplication/publicApi/entities/models';
import { getEntityTypeIdentifierQueryParams, isEntityTypeIdentifier } from '../metadataDispatcher/entities/utils';
import { isValidGuid } from '@/components/formDesigner/components/utils';

export interface IStoredFilesProviderProps {
  name?: string;
  ownerId: string;
  ownerType: string | IEntityTypeIdentifier;
  ownerName?: string;
  filesCategory?: string;
  propertyName?: string;
  baseUrl?: string;

  // used for requered field validation
  value?: IStoredFile[];
  onChange?: (fileList: IStoredFile[], isUserAction?: boolean) => void;
  onDownload?: (fileList: IStoredFile[], isUserAction?: boolean) => void;
}

const fileReducer = (data: IStoredFile): IStoredFile => {
  return { ...data, uid: data.id };
};

const filesReducer = (data: IStoredFile[]): IStoredFile[] => {
  if (!data) return data;

  // Map files and deduplicate by ID, keeping the last occurrence (most recent version)
  const fileMap = new Map<string, IStoredFile>();
  data.forEach((file) => {
    const processedFile = fileReducer(file);
    if (processedFile.id) {
      fileMap.set(processedFile.id, processedFile);
    }
  });

  return Array.from(fileMap.values());
};

const uploadFileEndpoint: IApiEndpoint = { url: '/api/StoredFile/Upload', httpVerb: 'POST' };
const replaceFileEndpoint: IApiEndpoint = { url: '/api/StoredFile/UploadNewVersion', httpVerb: 'POST' };
const filesListEndpoint: IApiEndpoint = { url: '/api/StoredFile/FilesList', httpVerb: 'GET' };

const StoredFilesProvider: FC<PropsWithChildren<IStoredFilesProviderProps>> = ({
  children,
  name,
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
      ownerType: getEntityTypeIdentifierQueryParams(ownerType),
      ownerName,
      filesCategory,
      propertyName,
    },
    lazy: true,
  });

  const { mutate: uploadFileHttp } = useMutate<FormData, IAjaxResponse<IStoredFile>>();
  const { mutate: replaceFileHttp } = useMutate<FormData, IAjaxResponse<IStoredFile>>();


  // Initialize fileList from value prop when component mounts or value changes
  useEffect(() => {
    if (value && value.length > 0 && (!state.fileList || state.fileList.length === 0)) {
      dispatch(initializeFileListAction(value as IStoredFile[]));
    }
  }, [value]);

  useEffect(() => {
    if (ownerId && ownerType) {
      fetchFileListHttp();
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
      onChange?.(next, false); // Not a user action - external SignalR event
    });

    connection?.on('OnFileDeleted', (eventData: IStoredFile | string) => {
      const patient = typeof eventData === 'object' ? eventData : (JSON.parse(eventData) as IStoredFile);

      dispatch(onFileDeletedAction(patient?.id));
      onChange?.(fileListRef.current?.filter((file) => file.id !== patient?.id) || [], false); // Not a user action - external SignalR event
    });
    return () => {
      connection?.off('OnFileAdded');
      connection?.off('OnFileDeleted');
    };
  }, []);
  //#endregion

  const uploadFile = (payload: IUploadFilePayload): void => {
    const formData = new FormData();

    const { file } = payload;

    formData.append('ownerId', payload.ownerId || ownerId);
    const entityType = payload.ownerType || ownerType;
    if (isEntityTypeIdentifier(entityType)) {
      formData.append('ownerType.name', entityType.name);
      formData.append('ownerType.module', entityType.module);
    } else {
      formData.append('ownerType.entityType', entityType);
    }
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
        }),
      );
      return;
    }

    dispatch(uploadFileRequestAction(newFile));

    uploadFileHttp(uploadFileEndpoint, formData)
      .then((response) => {
        const responseFile = extractAjaxResponse(response);
        responseFile.uid = newFile.uid;
        dispatch(uploadFileSuccessAction({ ...responseFile }));
        const updatedFileList = addFile(responseFile, fileListRef.current);
        onChange?.(updatedFileList, true); // User action - file upload

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

  const deleteFileSuccess = (fileIdToDelete: string): void => {
    dispatch(deleteFileSuccessAction(fileIdToDelete));
  };

  const deleteFileError = (fileIdToDelete: string): void => {
    dispatch(deleteFileErrorAction(fileIdToDelete));
  };

  const deleteFile = (fileIdToDelete: string): void => {
    dispatch(deleteFileRequestAction(fileIdToDelete));

    const list = state.fileList ?? [];
    const found = list.find((x) => x.id === fileIdToDelete || x.uid === fileIdToDelete);
    const resolvedId = found?.id;

    if (!resolvedId) {
      // nothing to delete; dispatch error and exit
      dispatch(deleteFileErrorAction(fileIdToDelete));
      return;
    }

    deleteFileHttp({ id: resolvedId })
      .then(() => {
        deleteFileSuccess(resolvedId);
        const updateList = removeFile(list, resolvedId);
        onChange?.(updateList, true); // User action - file delete
        if (typeof removeDelayedUpdate === 'function') {
          removeDelayedUpdate(STORED_FILES_DELAYED_UPDATE, resolvedId);
        }
      })
      .catch(() => {
        deleteFileError(resolvedId);
      });
  };

  //#endregion

  //#region replace file
  const replaceFile = (payload: IReplaceFilePayload): void => {
    const { file, fileId } = payload;

    // Validate that fileId is a persisted stored-file identifier
    if (!fileId || !isValidGuid(fileId)) {
      const errorMsg = 'Cannot replace file: file must be persisted before replacement. Please wait for upload to complete.';
      message.error(errorMsg);
      console.warn('replaceFile: Invalid or missing fileId', { fileId, file: file.name });
      // Dispatch error action to update UI state if needed
      if (fileId) {
        dispatch(replaceFileErrorAction(fileId));
      }
      return;
    }

    // Normalize file extension to lowercase to avoid case sensitivity issues on Linux
    const normalizedFile = normalizeFileName(file);

    const formData = new FormData();
    formData.append('file', normalizedFile);
    formData.append('id', fileId);

    dispatch(replaceFileRequestAction(fileId));

    replaceFileHttp(replaceFileEndpoint, formData)
      .then((response) => {
        const responseFile = extractAjaxResponse(response);
        responseFile.uid = responseFile.id;
        dispatch(replaceFileSuccessAction({ originalFileId: fileId, newFile: { ...responseFile } }));

        // Update the fileList by replacing the old file with the new one
        const currentList = fileListRef.current ?? [];
        const updatedList = currentList.map((f) =>
          f.id === fileId || f.uid === fileId ? { ...responseFile, uid: responseFile.id } : f,
        );
        onChange?.(updatedList, true); // User action - file replace
        message.success(`File "${normalizedFile.name}" replaced successfully`);
      })
      .catch((e) => {
        message.error(`File replacement failed. ${e.message || 'Please try again.'}`);
        console.error(e);
        dispatch(replaceFileErrorAction(fileId));
      });
  };
  //#endregion

  const downloadZipFile = (payload: IDownloadZipPayload = null): void => {
    dispatch(downloadZipRequestAction());
    const query = !!payload
      ? payload
      : !!ownerId
        ? {
          ownerId: ownerId,
          ownerType: getEntityTypeIdentifierQueryParams(ownerType),
          filesCategory: filesCategory,
          ownerName: ownerName,
        }
        : {
          filesId: fileListRef.current?.map((x) => x.id).filter((x) => !!x),
        };
    axios({
      url: `${baseUrl ?? backendUrl}/api/StoredFile/DownloadZip?${qs.stringify(query, { allowDots: true })}`,
      method: 'GET',
      responseType: 'blob',
      headers,
    })
      .then((response) => {
        dispatch(downloadZipSuccessAction());
        FileSaver.saveAs(new Blob([response.data]), `Files.zip`);
        dispatch(updateAllFilesDownloadedByCurrentUser());
        const updatedList = updateAllFilesDownloaded(fileListRef.current ?? []);
        onDownload?.(updatedList, true); // User action - zip download
      })
      .catch(() => {
        dispatch(downloadZipErrorAction());
      });
  };

  const downloadFile = (payload: IDownloadFilePayload): void => {
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
        onDownload?.(nextList, true); // User action - file download
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const contextMetadata = useMemo<Promise<IObjectMetadata>>(() => Promise.resolve({
    typeDefinitionLoader: () => {
      return Promise.resolve({
        typeName: 'IFileListContextApi',
        files: [{ content: fileListContextCode, fileName: 'apis/fileListContextApi.ts' }],
      });
    },
    properties: [],
    dataType: DataTypes.object,
  }), []);

  return (
    <ConditionalWrap
      condition={Boolean(name)}
      wrap={(children) => (
        <DataContextBinder
          id={`ctx_fl_${name}`}
          name={name}
          description={`File list context for ${name}`}
          type="control"
          data={state}
          metadata={contextMetadata}
        >
          {children}
        </DataContextBinder>
      )}
    >
      <StoredFilesStateContext.Provider value={state}>
        <StoredFilesActionsContext.Provider
          value={{
            ...getFlagSetters(dispatch),
            uploadFile,
            replaceFile,
            deleteFile,
            downloadZipFile,
            downloadFile, /* NEW_ACTION_GOES_HERE */
          }}
        >
          {children}
        </StoredFilesActionsContext.Provider>
      </StoredFilesStateContext.Provider>
    </ConditionalWrap>
  );
};

function useStoredFilesState(): IStoredFilesStateContext | undefined {
  const context = useContext(StoredFilesStateContext);

  if (context === undefined) {
    throw new Error('useStoredFilesState must be used within a StoredFilesProvider');
  }

  return context;
}

function useStoredFilesActions(): IStoredFilesActionsContext | undefined {
  const context = useContext(StoredFilesActionsContext);

  if (context === undefined) {
    throw new Error('useStoredFilesActions must be used within a StoredFilesProvider');
  }

  return context;
}

function useStoredFilesStore(): IStoredFilesStateContext & IStoredFilesActionsContext {
  return { ...useStoredFilesState(), ...useStoredFilesActions() };
}

export default StoredFilesProvider;

/**
 * @deprecated - use useStoredFilesStore
 */
const useStoredFiles = useStoredFilesStore;

export { StoredFilesProvider, useStoredFiles, useStoredFilesActions, useStoredFilesState, useStoredFilesStore };
export type { IStoredFile };
