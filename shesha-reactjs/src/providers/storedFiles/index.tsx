import axios from 'axios';
import FileSaver from 'file-saver';
import { IAjaxResponse } from '@/interfaces';
import qs from 'qs';
import React, { FC, PropsWithChildren, useContext, useEffect, useReducer } from 'react';
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
}

const fileReducer = (data: IStoredFile): IStoredFile => {
  return { ...data, uid: data.id };
};

const filesReducer = (data: IStoredFile[]): IStoredFile[] => data?.map((file) => fileReducer(file));

const hasDownloadedEndpoint: IApiEndpoint = { url: '/api/StoredFile/HasDownloaded', httpVerb: 'GET' };
const markAsDownloadedEndpoint: IApiEndpoint = { url: '/api/StoredFile/MarkAsDownloaded', httpVerb: 'POST' };
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
  value = []
}) => {
  const [state, dispatch] = useReducer(storedFilesReducer, {
    ...STORED_FILES_CONTEXT_INITIAL_STATE,
  });

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

  const hasDownloaded = async (fileId: string): Promise<boolean> => {
    if (!fileId) return false;
    try {
      const response = await axios({
        baseURL: baseUrl ?? backendUrl,
        url: `${hasDownloadedEndpoint.url}?id=${fileId}`,
        method: 'GET',
        headers,
      });
      const data = response.data as IAjaxResponse<boolean>;
      return Boolean(data?.result);
    } catch {
      return false;
    }
  };

  const enrichFilesWithDownloadStatus = async (files: IStoredFile[]): Promise<IStoredFile[]> => {
    const enriched = await Promise.all(
      (files || []).map(async (file) => ({
        ...file,
        isDownloadedByCurrentUser: await hasDownloaded(file.id),
      }))
    );
    return enriched;
  };

  // Initialize fileList from value prop when component mounts or value changes
  useEffect(() => {
    if (value && value.length > 0 && (!state.fileList || state.fileList.length === 0)) {
      const enrichValueWithDownloadStatus = async () => {
        const enrichedValue = await enrichFilesWithDownloadStatus(value as IStoredFile[]);
        dispatch(initializeFileListAction(enrichedValue));
      };

      enrichValueWithDownloadStatus().catch(() => {
        // Fallback to original value if enrichment fails
        dispatch(initializeFileListAction(value as IStoredFile[]));
      });
    }
  }, [value]);

  useEffect(() => {
    const val = state.fileList?.length > 0 ? state.fileList : [];
    const filesUids = val ? val?.map(file => file.uid).filter(uid => !uid?.includes('rc-upload')) : [];
    const valueUids = value ? value.map(file => file.uid) : [];

    if (JSON.stringify(filesUids) !== JSON.stringify(valueUids)) {
      onChange?.(val);
    }
  }, [state.fileList]);

  useEffect(() => {
    if ((ownerId || '') !== '' && (ownerType || '') !== '') {
      fetchFileListHttp();
    }
  }, [ownerId, ownerType, filesCategory, propertyName]);

  useEffect(() => {
    if (!isFetchingFileList && fileListResponse) {
      const processFileList = async () => {
        const { result } = fileListResponse;
        const fileList = filesReducer(result as IStoredFile[]);
        const enrichedFileList = await enrichFilesWithDownloadStatus(fileList);
        dispatch(fetchFileListSuccessAction(enrichedFileList));
      };

      processFileList().catch(() => {
        dispatch(fetchFileListErrorAction());
      });
    }
  }, [isFetchingFileList, fileListResponse]);

  //#region Register signal r events
  useEffect(() => {
    connection?.on('OnFileAdded', (eventData: IStoredFile | string) => {
      const patient = typeof eventData === 'object' ? eventData : (JSON.parse(eventData) as IStoredFile);

      dispatch(onFileAddedAction(patient));
    });

    connection?.on('OnFileDeleted', (eventData: IStoredFile | string) => {
      const patient = typeof eventData === 'object' ? eventData : (JSON.parse(eventData) as IStoredFile);

      dispatch(onFileDeletedAction(patient?.id));
    });
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

    // @ts-ignore
    const newFile: IStoredFile = { uid: '', ...file, status: 'uploading', name: file.name, linkProps: '{"download": "image"}' };

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
        if (typeof addDelayedUpdate === 'function') removeDelayedUpdate(STORED_FILES_DELAYED_UPDATE, fileIdToDelete);
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
          filesId: state.fileList?.map(x => x.id).filter(x => !!x),
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
      })
      .catch(() => {
        dispatch(downloadZipErrorAction());
      });
  };

  const markFileAsDownloaded = async (fileId: string): Promise<void> => {
    if (!fileId) return;
    try {
      await axios({
        baseURL: baseUrl ?? backendUrl,
        url: `${markAsDownloadedEndpoint.url}?id=${fileId}`,
        method: 'POST',
        headers,
      });
    } catch {
      // ignore errors silently; UI will still reflect local state
    }
  };

  const downloadFile = (payload: IDownloadFilePayload) => {
    const url = `${baseUrl}/api/StoredFile/Download?${qs.stringify({
      id: payload.fileId,
    })}`;
    axios({
      url,
      method: 'GET',
      responseType: 'blob',
      headers,
    })
      .then(async (response) => {
        FileSaver.saveAs(new Blob([response.data]), payload.fileName);

        // Track the download
        await markFileAsDownloaded(payload.fileId);

        // Update the file list to reflect the download status
        const updatedFileList = state.fileList?.map(file =>
          file.id === payload.fileId
            ? { ...file, isDownloadedByCurrentUser: true }
            : file
        ) || [];

        if (updatedFileList.length > 0) {
          dispatch(fetchFileListSuccessAction(updatedFileList));
        }
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
          downloadFile,          /* NEW_ACTION_GOES_HERE */
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
