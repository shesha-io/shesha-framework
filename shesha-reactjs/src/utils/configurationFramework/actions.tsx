import axios, { AxiosResponse } from 'axios';
import FileSaver from 'file-saver';
import IRequestHeaders from '@/interfaces/requestHeaders';
import React, { FC } from 'react';
import { ConfigurationItemVersionStatus } from './models';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { FormConfigurationDto } from '@/providers/form/api';
import { getEntityFilterByIds } from '@/utils/graphQl';
import { axiosHttp, getFileNameFromResponse } from '@/utils/fetchers';
import { IAbpWrappedGetEntityResponse, IAbpWrappedResponse } from '@/interfaces/gql';
import { IAjaxResponseBase } from '@/interfaces/ajaxResponse';
import { IErrorInfo } from '@/interfaces/errorInfo';
import { MessageInstance } from 'antd/lib/message/interface';
import { NotificationInstance } from 'antd/lib/notification/interface';
import { HookAPI as ModalHookAPI } from 'antd/lib/modal/useModal';

//#region validation

interface IErrorDetailsProps {
  error: IErrorInfo;
}
export const ErrorDetails: FC<IErrorDetailsProps> = ({ error }) => {
  return (
    <div>
      {/* <strong>{error.details}</strong> */}
      <ul>{error.validationErrors?.map((e, i) => <li key={i}>{e.message}</li>)}</ul>
    </div>
  );
};

export const showErrorDetails = (message: MessageInstance, notification: NotificationInstance, error: any) => {
  const response = error.response?.data as IAjaxResponseBase;
  if (response && response.error) {
    notification.error({
      message: 'Sorry! An error occurred.',
      icon: null,
      description: <ErrorDetails error={response.error} />,
    });
  } else message.error('An error occurred. Message:' + error);
};

//#endregion

export interface ItemWithIdPayload {
  id: string;
}

export interface IConfigurationFrameworkHookArguments {
  backendUrl: string;
  httpHeaders: IRequestHeaders;
}

interface IHasHttpSettings {
  backendUrl: string;
  httpHeaders: IRequestHeaders;
}

export interface IHasConfigurableItemId {
  itemId: string;
}

interface UpdateItemStatusArgs extends IHasHttpSettings {
  id: string;
  status: ConfigurationItemVersionStatus;
  onSuccess?: () => void;
  onFail?: (e: any) => void;
  message: MessageInstance;
}
export const updateItemStatus = (props: UpdateItemStatusArgs) => {
  const { message } = props;
  const url = `/api/services/app/ConfigurationItem/UpdateStatus`;
  const httpPayload = {
    filter: getEntityFilterByIds([props.id]),
    status: props.status,
  };
  return axiosHttp(props.backendUrl)
    .put<any, AxiosResponse<IAbpWrappedGetEntityResponse<FormConfigurationDto>>>(url, httpPayload, {
      headers: props.httpHeaders,
    })
    .then((_response) => {
      message.destroy();
      if (props.onSuccess) props.onSuccess();
    })
    .catch((e) => {
      message.destroy();
      message.error('An error occurred. Message:' + e);
      if (props.onFail) props.onFail(e);
    });
};

//#region Publish
export interface IPublishItemPayload extends IHasHttpSettings {
  id: string;
  message: MessageInstance;
  modal: ModalHookAPI;
}
export interface IPublishItemResponse {
  id: string;
}
export const publishItem = (payload: IPublishItemPayload): Promise<IPublishItemResponse> => {
  if (!payload.id) throw 'Id must not be null';
  const { message, modal } = payload;

  return new Promise<IPublishItemResponse>((resolve, reject) => {
    const onOk = () => {
      message.loading('Publishing in progress..', 0);
      updateItemStatus({
        backendUrl: payload.backendUrl,
        httpHeaders: payload.httpHeaders,
        id: payload.id,
        status: ConfigurationItemVersionStatus.Live,
        onSuccess: () => {
          resolve({ id: payload.id });
        },
        onFail: (e) => {
          reject(e);
        },
        message,
      });
    };
    modal.confirm({
      title: 'Publish Item',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to publish this item?',
      okText: 'Yes',
      onCancel: () => {
        reject();
      },
      cancelText: 'No',
      onOk,
    });
  });
};

//#endregion

//#region Set item ready
export interface ISetItemReadyPayload extends IHasHttpSettings {
  id: string;
  message: MessageInstance;
  modal: ModalHookAPI;
}
export interface ISetItemReadyResponse {
  id: string;
}
export const setItemReady = (payload: ISetItemReadyPayload): Promise<ISetItemReadyResponse> => {
  if (!payload.id) throw 'Id must not be null';
  const { message, modal } = payload;
  return new Promise<ISetItemReadyResponse>((resolve, reject) => {
    const onOk = () => {
      updateItemStatus({
        backendUrl: payload.backendUrl,
        httpHeaders: payload.httpHeaders,
        id: payload.id,
        status: ConfigurationItemVersionStatus.Ready,
        onSuccess: () => {
          resolve({ id: payload.id });
        },
        message,
      });
    };
    modal.confirm({
      title: 'Set Ready',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to set this form ready?',
      okText: 'Yes',
      onCancel: () => {
        reject();
      },
      cancelText: 'No',
      onOk,
    });
  });
};

//#endregion

//#region Set item ready
export interface IDeleteItemPayload extends IHasHttpSettings {
  id: string;
}
export interface IDeleteItemResponse {
  id: string;
}
export const deleteItem = (payload: IDeleteItemPayload): Promise<IDeleteItemResponse> => {
  if (!payload.id) throw 'Id must not be null';
  return new Promise<IDeleteItemResponse>((resolve) => {
    const url = `/api/services/app/ConfigurationItem/Delete?id=${payload.id}`;
    return axiosHttp(payload.backendUrl)
      .delete<any, AxiosResponse<IAbpWrappedResponse<string>>>(url, { headers: payload.httpHeaders })
      .then((response) => {
        resolve({ id: response.data.result });
      });
  });
};

//#endregion

//#region Create new version
export interface ICreateNewItemVersionPayload extends IHasHttpSettings {
  id: string;
  message: MessageInstance;
  notification: NotificationInstance;
  modal: ModalHookAPI;
}
export interface ICreateNewItemVersionResponse {
  id: string;
}

export const createNewVersionRequest = (
  payload: ICreateNewItemVersionPayload
): Promise<AxiosResponse<IAbpWrappedGetEntityResponse<FormConfigurationDto>>> => {
  const url = `/api/services/app/ConfigurationItem/CreateNewVersion`;
  const httpPayload = {
    id: payload.id,
  };
  return axiosHttp(payload.backendUrl).post<any, AxiosResponse<IAbpWrappedGetEntityResponse<FormConfigurationDto>>>(url, httpPayload, {
    headers: payload.httpHeaders,
  });
};

export const createNewVersion = (payload: ICreateNewItemVersionPayload): Promise<ICreateNewItemVersionResponse> => {
  const { message, notification, modal } = payload;
  return new Promise<ICreateNewItemVersionResponse>((resolve, reject) => {
    const onOk = () => {
      return createNewVersionRequest(payload)
        .then((response) => {
          message.destroy();
          resolve({ id: response.data.result.id });
          //message.info('New version created successfully', 3);
        })
        .catch((e) => {
          message.destroy();
          showErrorDetails(message, notification, e);
        });
    };
    modal.confirm({
      title: 'Create New Version',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to create new version of the item?',
      okText: 'Yes',
      onCancel: () => {
        reject();
      },
      cancelText: 'No',
      onOk,
    });
  });
};

//#endregion

//#region Cancel version
export interface ICancelItemVersionPayload extends IHasHttpSettings {
  id: string;
  message: MessageInstance;
  modal: ModalHookAPI;
}
export interface ICancelItemVersionResponse {
  id: string;
}
export const itemCancelVersion = (payload: ICancelItemVersionPayload): Promise<ICancelItemVersionResponse> => {
  const { message, modal } = payload;
  return new Promise((resolve, reject) => {
    const onOk = () => {
      const url = `/api/services/app/ConfigurationItem/CancelVersion`;
      const httpPayload = {
        id: payload.id,
      };
      return axiosHttp(payload.backendUrl)
        .post<any, AxiosResponse<IAbpWrappedGetEntityResponse<FormConfigurationDto>>>(url, httpPayload, {
          headers: payload.httpHeaders,
        })
        .then((response) => {
          message.destroy();
          //message.info('Version cancelled successfully', 3);
          resolve({ id: response?.data?.result?.id });
        })
        .catch((e) => {
          reject(e);
          message.destroy();
          message.error('An error occurred. Message:' + e);
        });
    };
    modal.confirm({
      title: 'Cancel form version',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to cancel current version?',
      okText: 'Yes',
      onCancel: () => {
        reject();
      },
      cancelText: 'No',
      onOk,
    });
  });
};

//#endregion

//#region Download as JSON
export interface IDownloadItemAsJsonPayload extends IHasHttpSettings {
  id: string;
}
export interface IDownloadItemAsJsonResponse {
  id: string;
}
export const downloadAsJson = (payload: IDownloadItemAsJsonPayload): Promise<IDownloadItemAsJsonResponse> => {
  const url = `${payload.backendUrl}/api/services/Shesha/FormConfiguration/GetJson?id=${payload.id}`;
  return axios({
    url: url,
    method: 'GET',
    responseType: 'blob', // important
    headers: payload.httpHeaders,
  }).then((response) => {
    const fileName = getFileNameFromResponse(response) ?? 'form.json';
    FileSaver.saveAs(new Blob([response.data]), fileName);
    return { id: payload.id };
  });
};

//#endregion

export const ConfigurationFrameworkActions = {
  updateStatus: updateItemStatus,
  cancelVersion: itemCancelVersion,
  publish: publishItem,
  setReady: setItemReady,
  createNewVersion: createNewVersion,
  createNewVersionRequest: createNewVersionRequest,
};