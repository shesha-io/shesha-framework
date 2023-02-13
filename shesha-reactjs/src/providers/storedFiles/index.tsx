import React, { FC, useReducer, useContext, PropsWithChildren, useEffect } from 'react';
import { storedFilesReducer } from './reducer';
import {
  StoredFilesActionsContext,
  StoredFilesStateContext,
  STORED_FILES_CONTEXT_INITIAL_STATE,
  IStoredFile,
  IUploadFilePayload,
  IDownloadZipPayload,
  IDownloadFilePayload,
} from './contexts';
import { getFlagSetters } from '../utils/flagsSetters';
import {
  uploadFileSuccessAction,
  uploadFileErrorAction,
  deleteFileRequestAction,
  deleteFileSuccessAction,
  deleteFileErrorAction,
  fetchFileListSuccessAction,
  fetchFileListErrorAction,
  uploadFileRequestAction,
  downloadZipRequestAction,
  downloadZipSuccessAction,
  downloadZipErrorAction,
  onFileAddedAction,
  onFileDeletedAction,
  /* NEW_ACTION_IMPORT_GOES_HERE */
} from './actions';
import axios from 'axios';
import FileSaver from 'file-saver';
import qs from 'qs';
import { useMutate } from 'restful-react';
import { useStoredFileFilesList } from '../../apis/storedFile';
import { useSignalR } from '../signalR';
import { useApplicationConfiguration } from '../../hooks';
import { useSheshaApplication } from '../sheshaApplication';
export interface IStoredFilesProviderProps {
  ownerId: string;
  ownerType: string;
  filesCategory?: number;
  propertyName?: string;
  allCategories?: boolean;
  baseUrl?: string;
}

const filesReducer = (data: IStoredFile[]): IStoredFile[] => data.map(file => fileReducer(file));

const fileReducer = (data: IStoredFile): IStoredFile => {
  return { ...data, uid: data.id };
};

const StoredFilesProvider: FC<PropsWithChildren<IStoredFilesProviderProps>> = ({
  children,
  ownerId,
  ownerType,
  filesCategory,
  propertyName,
  baseUrl,
  allCategories = true,
}) => {
  const [state, dispatch] = useReducer(storedFilesReducer, {
    ...STORED_FILES_CONTEXT_INITIAL_STATE,
    ownerId,
    ownerType,
    filesCategory,
    propertyName,
    allCategories,
  });

  const { connection } = useSignalR(false) ?? {};
  const { httpHeaders: headers } = useSheshaApplication();

  const { config } = useApplicationConfiguration();

  const { loading: isFetchingFileList, refetch: fetchFileListHttp, data: fileListResponse } = useStoredFileFilesList({
    queryParams: {
      ownerId,
      ownerType,
      filesCategory,
      propertyName,
      allCategories,
    },
    lazy: true,
    requestOptions: {
      headers,
    },
  });

  const { mutate: uploadFileHttp } = useMutate({
    path: '/api/StoredFile/Upload',
    verb: 'POST',
    requestOptions: {
      headers,
    },
  });

  useEffect(() => {
    if ((ownerId || '') !== '' && (ownerType || '') !== '') {
      fetchFileListHttp();
    }
  }, [ownerId, ownerType, filesCategory, propertyName, allCategories]);

  useEffect(() => {
    if (!isFetchingFileList) {
      if (fileListResponse) {
        // @ts-ignore
        const { result } = fileListResponse;
        const fileList = filesReducer(result as IStoredFile[]);

        dispatch(fetchFileListSuccessAction(fileList));
      } else {
        dispatch(fetchFileListErrorAction());
      }
    }
  }, [isFetchingFileList]);

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

    formData.append('ownerId', payload.ownerId || state.ownerId);
    formData.append('ownerType', payload.ownerType || state.ownerType);
    formData.append('file', file);
    formData.append('filesCategory', `${filesCategory}`);
    formData.append('propertyName', '');

    // @ts-ignore
    const newFile: IStoredFile = { uid: '', ...file, status: 'uploading', name: file.name };

    dispatch(uploadFileRequestAction(newFile));

    uploadFileHttp(formData)
      .then(response => {
        const responseFile = response.result as IStoredFile;

        responseFile.uid = newFile.uid;

        dispatch(uploadFileSuccessAction({ ...responseFile }));
      })
      .catch(e => {
        console.error(e);
        dispatch(uploadFileErrorAction({ ...newFile, status: 'error' }));
      });
  };

  const { mutate: deleteFileHttp } = useMutate({
    queryParams: { Id: state.fileIdToDelete }, // Important if you'll be calling this as a side-effect
    path: '/api/StoredFile',
    verb: 'DELETE',
    requestOptions: {
      headers,
    },
  });

  //#region delete file
  const deleteFile = (fileIdToDelete: string) => {
    dispatch(deleteFileRequestAction(fileIdToDelete));

    deleteFileHttp('', { queryParams: { Id: fileIdToDelete } })
      .then(() => {
        deleteFileSuccess(fileIdToDelete);
      })
      .catch(() => deleteFileError());
  };

  const deleteFileSuccess = (fileIdToDelete: string) => {
    dispatch(deleteFileSuccessAction(fileIdToDelete));
  };

  const deleteFileError = () => {
    dispatch(deleteFileErrorAction());
  };
  //#endregion

  const downloadZipFile = (payload: IDownloadZipPayload = null) => {
    dispatch(downloadZipRequestAction());
    axios({
      url: `${baseUrl ?? config?.baseUrl}/api/StoredFile/DownloadZip?${qs.stringify(
        payload || { ownerId: state.ownerId, ownerType: state.ownerType }
      )}`,
      method: 'GET',
      responseType: 'blob',
      headers,
    })
      .then(response => {
        dispatch(downloadZipSuccessAction());
        FileSaver.saveAs(new Blob([response.data]), `Files.zip`);
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
      .then(response => {
        FileSaver.saveAs(new Blob([response.data]), payload.fileName);
      })
      .catch(e => {
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
          downloadFile,
          /* NEW_ACTION_GOES_HERE */
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

export { StoredFilesProvider, useStoredFilesState, useStoredFilesActions, useStoredFiles, useStoredFilesStore };
