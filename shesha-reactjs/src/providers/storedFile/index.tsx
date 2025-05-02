import axios from 'axios';
import FileSaver from 'file-saver';
import qs from 'qs';
import React, {
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useReducer
  } from 'react';
import { getFlagSetters } from '../utils/flagsSetters';
import { STORED_FILES_DELAYED_UPDATE } from '@/providers/delayedUpdateProvider/models';
import { storedFilesReducer as storedFileReducer } from './reducer';
import { useDelayedUpdate } from '@/providers/delayedUpdateProvider';
import { useMutate } from '@/hooks';
import { useSheshaApplication } from '@/providers';
import {
  StoredFileDeleteQueryParams,
  StoredFileGetQueryParams,
  useStoredFileGet,
  useStoredFileGetEntityProperty,
} from '@/apis/storedFile';
import {
  deleteFileErrorAction,
  deleteFileRequestAction,
  deleteFileSuccessAction,
  downloadFileErrorAction,
  downloadFileRequestAction,
  downloadFileSuccessAction,
  fetchFileInfoErrorAction,
  fetchFileInfoRequestAction,
  fetchFileInfoSuccessAction,
  fileViewErrorAction,
  fileViewRequestAction,
  fileViewSuccessAction,
  uploadFileErrorAction,
  uploadFileRequestAction,
  uploadFileSuccessAction,
} from './actions';
import {
  IDownloadFilePayload,
  IStoredFile,
  IUploadFilePayload,
  STORED_FILE_CONTEXT_INITIAL_STATE,
  StoredFileActionsContext,
  StoredFileStateContext,
} from './contexts';
import { App } from 'antd';

export interface IStoredFileProviderPropsBase {
  baseUrl?: string;
}

export interface IEntityProperty extends IStoredFileProviderPropsBase {
  ownerId: string;
  ownerType: string;
  propertyName: string;
}

export interface ISingleFile extends IStoredFileProviderPropsBase {
  fileId: string;
}

export type FileUploadMode = 'async' | 'sync';

export interface IStoredFileProviderProps {
  ownerId?: string;
  ownerType?: string;
  fileCategory?: string;
  propertyName?: string;
  fileId?: string;
  baseUrl?: string;
  uploadMode?: FileUploadMode;
  value?: any;
  onChange?: (value: any) => void;
}

const StoredFileProvider: FC<PropsWithChildren<IStoredFileProviderProps>> = (props) => {
  const {
    ownerId,
    ownerType,
    fileCategory,
    propertyName,
    fileId,
    children,
    baseUrl: modelBackendUrl,
    uploadMode = 'async',
    onChange,
    value,
  } = props;

  const newFileId = fileId ?? value?.id ?? value;

  const [state, dispatch] = useReducer(storedFileReducer, {
    ...STORED_FILE_CONTEXT_INITIAL_STATE,
  });
  const { message } = App.useApp();

  const { backendUrl, httpHeaders: headers } = useSheshaApplication();

  const baseUrl = modelBackendUrl || backendUrl;

  const fileFetcher = useStoredFileGet({
    lazy: true,
  });

  const propertyFetcher = useStoredFileGetEntityProperty({
    lazy: true,
  });
  const {
    loading: isFetchingFileInfo,
    error: fetchingFileInfoError,
    data: fetchingFileInfoResponse,
  } = newFileId ? fileFetcher : propertyFetcher;

  const { addItem: addDelayedUpdate, removeItem: removeDelayedUpdate } = useDelayedUpdate(false) ?? {};

  const doFetchFileInfo = () => {
    if (
      state.fileInfo?.id !== undefined &&
      state.fileInfo?.id === newFileId
    )
      return;

    if (newFileId)
      fileFetcher.refetch({ queryParams: { id: newFileId } });
    else
    if (ownerId && ownerType && propertyName)
      propertyFetcher.refetch({ queryParams: { ownerId, ownerType, propertyName, fileCategory } });
  };

  useEffect(() => {
    if (uploadMode === 'async') doFetchFileInfo();
  }, [uploadMode, ownerId, ownerType, propertyName, newFileId]);

  useEffect(() => {
    if (uploadMode === 'sync' && value) {
      const fileInfo: IStoredFile = value
        ? {
            //id: value.uid,
            uid: value.uid,
            url: null,
            status: 'done',
            name: value.name,
            size: value.size,
            type: value.type,
            originFileObj: null,
          }
        : null;

      dispatch(fetchFileInfoSuccessAction(fileInfo));
    }
    if (uploadMode === 'sync' && !Boolean(value)) {
      dispatch(deleteFileSuccessAction());
    }
  }, [uploadMode, value]);

  useEffect(() => {
    if (!isFetchingFileInfo && uploadMode === 'async') {
      if (fetchingFileInfoResponse) {
        const fetchedFile = fetchingFileInfoResponse?.result;
        if (fetchedFile) {
          const fileInfo: IStoredFile = {
            id: fetchedFile.id,
            uid: fetchedFile.id,
            url: fetchedFile.url,
            status: 'done',
            name: fetchedFile.name,
            size: fetchedFile.size,
            type: fetchedFile.type,
            originFileObj: null,
          };

          dispatch(fetchFileInfoSuccessAction(fileInfo));
        }
      }

      if (fetchingFileInfoError) {
        // TODO: handle error
      }
    }
  }, [isFetchingFileInfo, fetchingFileInfoResponse, fetchingFileInfoError]);

  const downloadFileAsync = (payload: IDownloadFilePayload) => {
    dispatch(downloadFileRequestAction());

    const url = `${baseUrl}/api/StoredFile/Download?${qs.stringify({
      id: payload.fileId,
      versionNo: payload.versionNo,
    })}`;
    axios({
      url,
      method: 'GET',
      responseType: 'blob',
      headers,
    })
      .then((response) => {
        dispatch(downloadFileSuccessAction());
        FileSaver.saveAs(new Blob([response.data]), payload.fileName);
      })
      .catch(() => {
        dispatch(downloadFileErrorAction());
      });
  };

  const downloadFileSync = (_payload: IDownloadFilePayload) => {
    if (value) FileSaver.saveAs(new Blob([value]), value.name);
  };

  const downloadFile = (payload: IDownloadFilePayload) => {
    if (uploadMode === 'async') downloadFileAsync(payload);
    if (uploadMode === 'sync') downloadFileSync(payload);
  };

  const downloadFileSuccess = () => {
    dispatch(downloadFileSuccessAction());
  };

  const downloadFileError = () => {
    dispatch(downloadFileErrorAction());
  };

  const uploadFileAsync = (payload: IUploadFilePayload, callback?: (...args: any) => any) => {
    const formData = new FormData();

    const { file } = payload;

    const appendIfDefined = (itemName, itemValue) => {
      if (itemValue) formData.append(itemName, itemValue);
    };

    formData.append('file', file);
    appendIfDefined('id', fileId);
    appendIfDefined('ownerId', ownerId);
    appendIfDefined('ownerType', ownerType);
    if (fileCategory)
      appendIfDefined('filesCategory', fileCategory);
    appendIfDefined('propertyName', propertyName);

    const newFile: IStoredFile = {
      uid: '',
      ...file,
      status: 'uploading',
      name: file.name,
      size: file.size,
      type: file.type,
      originFileObj: null,
    };

    if (
      !Boolean(fileId) &&
      !(Boolean(ownerId) && Boolean(propertyName)) &&
      typeof addDelayedUpdate !== 'function'
    ) {
      console.error('File component is not configured');
      dispatch(
        uploadFileErrorAction({ ...newFile, uid: '-1', status: 'error', error: 'File component is not configured' })
      );
      return;
    }

    dispatch(uploadFileRequestAction(newFile));

    axios
      .put(`${baseUrl}/api/StoredFile`, formData, {
        headers,
      })
      .then((response: any) => {
        const responseFile = response.data.result as IStoredFile;

        responseFile.uid = newFile.uid;

        dispatch(uploadFileSuccessAction({ ...responseFile }));
        if (typeof onChange === 'function') onChange(responseFile?.id);
        if (callback) callback(responseFile);
        if (responseFile.temporary && typeof addDelayedUpdate === 'function')
          addDelayedUpdate(STORED_FILES_DELAYED_UPDATE, responseFile.id, { propertyName });
      })
      .catch((e) => {
        message.error(`File upload failed. Probably file size is too big`);
        console.error(e);
        dispatch(uploadFileErrorAction({ ...newFile, uid: '-1', status: 'error', error: 'uploading failed' }));
      });
  };

  // @ts-ignore
  const uploadFileSync = (payload: IUploadFilePayload, callback?: (...args: any) => any) => {
    if (typeof onChange === 'function') {
      onChange(payload.file);
      if (typeof callback === 'function') callback();
    }
  };

  const uploadFile = (payload: IUploadFilePayload, callback?: (...args: any) => any) => {
    if (uploadMode === 'async') return uploadFileAsync(payload, callback);
    if (uploadMode === 'sync') return uploadFileSync(payload, callback);
  };

  const { mutate: deleteFileHttp } = useMutate();

  //#region delete file
  const deleteFileSuccess = () => {
    dispatch(deleteFileSuccessAction());
  };

  const deleteFileError = () => {
    dispatch(deleteFileErrorAction());
  };

  const deleteFileAsync = () => {
    dispatch(deleteFileRequestAction());

    const deleteFileInput: StoredFileDeleteQueryParams = {
      fileId: fileId ?? state.fileInfo?.id,
      ownerId,
      ownerType,
      fileCategory,
      propertyName,
    };
    deleteFileHttp({ url: '/api/StoredFile/Delete?' + qs.stringify(deleteFileInput), httpVerb: 'DELETE' }, {})
      .then(() => {
        deleteFileSuccess();
        if (typeof onChange === 'function') onChange(null);
        if (typeof removeDelayedUpdate === 'function')
          removeDelayedUpdate(STORED_FILES_DELAYED_UPDATE, deleteFileInput.fileId);
      })
      .catch(() => deleteFileError());
  };

  const deleteFileSync = () => {
    if (typeof onChange === 'function') onChange(null);
  };

  const deleteFile = () => {
    if (uploadMode === 'async') deleteFileAsync();
    else deleteFileSync();
  };

  //#endregion

  const fetchFileInfo = () => {
    dispatch(fetchFileInfoRequestAction());
  };

  const fetchFileInfoError = () => {
    dispatch(fetchFileInfoErrorAction());
  };

  const getStoredFile = (payload: StoredFileGetQueryParams) => {
    return new Promise((resolve) => {
      dispatch(fileViewRequestAction());
      const url = `${baseUrl}/api/StoredFile/Base64String?${qs.stringify({
        id: payload.id,
      })}`;
      axios({
        url,
        method: 'GET',
        headers,
      })
        .then((response) => {
          dispatch(fileViewSuccessAction());
          return response?.data?.result?.base64String;
        })
        .then(resolve)
        .catch((e) => {
          dispatch(fileViewErrorAction());
          console.error(e);
        });
    });
  };
  /* NEW_ACTION_DECLARATION_GOES_HERE */

  return (
    <StoredFileStateContext.Provider value={state}>
      <StoredFileActionsContext.Provider
        value={{
          ...getFlagSetters(dispatch),
          downloadFile,
          downloadFileSuccess,
          downloadFileError,
          uploadFile,
          deleteFile,
          fetchFileInfo,
          fetchFileInfoError,
          getStoredFile,
          /* NEW_ACTION_GOES_HERE */
        }}
      >
        {children}
      </StoredFileActionsContext.Provider>
    </StoredFileStateContext.Provider>
  );
};

function useStoredFileState(required: boolean = true) {
  const context = useContext(StoredFileStateContext);

  if (context === undefined && required) {
    throw new Error('useStoredFileState must be used within a StoredFileProvider');
  }

  return context;
}

function useStoredFileActions(required: boolean = true) {
  const context = useContext(StoredFileActionsContext);

  if (context === undefined && required) {
    throw new Error('useStoredFileActions must be used within a StoredFileProvider');
  }

  return context;
}

function useStoredFile(required: boolean = true) {
  return { ...useStoredFileState(required), ...useStoredFileActions(required) };
}

export { StoredFileProvider, useStoredFile, useStoredFileActions, useStoredFileState };
