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
    refetch: fetchFileListHttp,
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

  // Fire onChange only for meaningful changes. Ignore download-only mutations (userHasDownloaded).
  const shouldTriggerOnDownloadRef = useRef(false);

  useEffect(() => {
    const val = state.fileList?.length > 0 ? state.fileList : [];

    if (!shouldTriggerOnDownloadRef.current && val?.map(file => file.uid).filter(uid => uid?.includes('rc-upload')).length === 0) {
      onChange?.(val);
    }
  }, [state.fileList]);

  // Ensure onDownload is called with the latest state after download flags update
  useEffect(() => {
    if (!shouldTriggerOnDownloadRef.current) return;
    shouldTriggerOnDownloadRef.current = false;
    onDownload?.(state.fileList ?? []);
  }, [state.fileList]);

  useEffect(() => {
    if ((ownerId || '') !== '' && (ownerType || '') !== '') {
      fetchFileListHttp()
        .then((resp) => {
          const { result } = resp ?? {} as any;
          const fileList = filesReducer(result as IStoredFile[]);
          dispatch(fetchFileListSuccessAction(fileList));
          onChange?.(fileList ?? []);
        })
        .catch(() => {
          dispatch(fetchFileListErrorAction());
        });
    }
  }, [ownerId, ownerType, filesCategory, propertyName]);

  //#region Register signal r events
  useEffect(() => {
    connection?.on('OnFileAdded', (eventData: IStoredFile | string) => {
      const patient = typeof eventData === 'object' ? eventData : (JSON.parse(eventData) as IStoredFile);

      dispatch(onFileAddedAction(patient));
    });

    connection?.on('OnFileDeleted', (eventData: IStoredFile | string) => {
      const patient = typeof eventData === 'object' ? eventData : (JSON.parse(eventData) as IStoredFile);
      const deletedId = patient?.id;
      if (!deletedId) return;
      dispatch(onFileDeletedAction(deletedId));
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
    const newFile: IStoredFile = { uid: '', ...file, status: 'uploading', name: file.name };

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

    // Dispatch and notify optimistically with the uploading item
    dispatch(uploadFileRequestAction(newFile));

    uploadFileHttp(uploadFileEndpoint, formData)
      .then((response) => {
        const responseFile = response.result as IStoredFile;
        responseFile.uid = newFile.uid;
        dispatch(uploadFileSuccessAction({ ...responseFile }));
        // Compute next list after success (replace by uid and set uid=id as reducer does)
        const updatedFile = fileReducer(responseFile);
        dispatch(uploadFileSuccessAction({ ...updatedFile }));
        onChange?.([...state.fileList, updatedFile]);

        if (responseFile.temporary && typeof addDelayedUpdate === 'function')
          addDelayedUpdate(STORED_FILES_DELAYED_UPDATE, responseFile.id, {
            ownerName: payload.ownerName || ownerName,
          });
      })
      .catch((e) => {
        message.error(`File upload failed. Probably file size is too big`);
        console.error(e);
        const errored = { ...newFile, status: 'error' } as IStoredFile;
        dispatch(uploadFileErrorAction(errored));
        const nextListError = (state.fileList ?? []).map((f) => (f.uid === newFile.uid ? errored : f));
        onChange?.(nextListError);
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
        const nextList = (state.fileList ?? []).filter(({ id, uid }) => id !== fileIdToDelete && uid !== fileIdToDelete);
        onChange?.(nextList);
        if (typeof addDelayedUpdate === 'function') {
          removeDelayedUpdate(STORED_FILES_DELAYED_UPDATE, fileIdToDelete);
        }; 
      })
      .catch((e) => {
        deleteFileError(fileIdToDelete);
        message.error('Failed to delete file');
        console.error(e);
      });
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
        dispatch(updateAllFilesDownloadedByCurrentUser());
        // Defer onDownload until after state.fileList reflects the update
        shouldTriggerOnDownloadRef.current = true;
      })
      .catch(() => {
        dispatch(downloadZipErrorAction());
      });
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
      .then((response) => {
        FileSaver.saveAs(new Blob([response.data]), payload.fileName);
        dispatch(updateIsDownloadedByCurrentUser(payload.fileId));
        // Defer onDownload until after state.fileList reflects the update
        shouldTriggerOnDownloadRef.current = true;
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
