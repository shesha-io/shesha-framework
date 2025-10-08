import React, { MutableRefObject, useState, FC } from 'react';
import { appendFormData } from '@/utils/form';
import {
  DeleteOutlined,
  FileZipTwoTone,
  InboxOutlined,
  LoadingOutlined,
} from '@ant-design/icons';

import { Form, Spin, Upload } from 'antd';
import { nanoid } from '@/utils/uuid';
import { RcFile, UploadFile } from 'antd/lib/upload/interface';

import { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import { useHttpClient } from '@/providers';
import { useStyles } from './styles/styles';
import { AxiosResponse } from 'axios';
import { IAbpWrappedResponse } from '@/interfaces/gql';
import { AnalyzePackageResponse } from './models';
import { PackageContent } from '../packageContent';

const { Dragger } = Upload;

export interface IImportInterface {
  importExecuter: () => Promise<any>;
}

export interface IConfigurationItemsImportProps {
  onImported?: () => void;
  importRef?: MutableRefObject<IImportInterface | undefined>;
}

export const ConfigurationItemsImport: FC<IConfigurationItemsImportProps> = (props) => {
  const { styles, prefixCls } = useStyles();
  const httpClient = useHttpClient();

  const [uploadFile, setUploadFile] = useState<UploadFile>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [packageContent, setPackageContent] = useState<AnalyzePackageResponse>(null);
  const [isPackLoading, setIsPackLoading] = useState(false);

  const onUploadRequest = async (payload: RcCustomRequestOptions): Promise<void> => {
    const formData = new FormData();
    const { file } = payload;

    formData.append('file', file);

    const rcFile = file as RcFile;
    setUploadFile({
      uid: nanoid(),
      url: null,
      status: 'done',
      name: rcFile.name,
      size: rcFile.size,
      type: rcFile.type,
      originFileObj: rcFile,
    });

    setIsPackLoading(true);

    try {
      const response = await httpClient.post<FormData, AxiosResponse<IAbpWrappedResponse<AnalyzePackageResponse>>>(`/api/services/app/ConfigurationStudio/AnalyzePackage`, formData);

      setPackageContent(response.data.success
        ? response.data.result
        : undefined,
      );
      payload.onSuccess({});
      setIsPackLoading(false);
    } catch (error) {
      console.error(error);
      payload.onError(error);
      setIsPackLoading(false);
    }
  };
  const onChangeSelection = (checkedIds: string[]): void => {
    setCheckedIds(checkedIds);
  };

  const onDeleteClick = (): void => {
    setUploadFile(null);
    setPackageContent(null);
  };

  const fileRender = (_originNode, file, _currFileList): JSX.Element => {
    return (
      <div className={styles.shaPackageUploadFile}>
        <span className={styles.shaPackageUploadFileThumbnail}>
          {isPackLoading
            ? (<LoadingOutlined style={{ fontSize: '26px' }} className="sha-upload-uploading" />)
            : (<FileZipTwoTone style={{ fontSize: '26px' }} />)}
        </span>
        <span className={`${prefixCls}-upload-list-item-name`} title={file.name}>
          {file.name}
        </span>
        <span className={`${prefixCls}-upload-list-item-card-actions picture`}>
          {!isPackLoading && (
            <a className="sha-upload-remove-control" onClick={onDeleteClick}>
              <DeleteOutlined title="Remove" />
            </a>
          )}
        </span>
      </div>
    );
  };

  const importExecuter = (): Promise<void> => {
    if (!uploadFile?.originFileObj)
      return Promise.reject('Please upload a file for import');
    if (checkedIds.length === 0)
      return Promise.reject('Please select items to import');

    setIsImporting(true);

    const formData = new FormData();
    formData.append('file', uploadFile.originFileObj);
    appendFormData(formData, 'itemsToImport', JSON.stringify(checkedIds));

    return httpClient.post(`/api/services/app/ConfigurationStudio/ImportPackage`, formData)
      .then(() => {
        setIsImporting(false);
      })
      .catch((e) => {
        setIsImporting(false);
        throw e;
      });
  };

  if (props.importRef)
    props.importRef.current = {
      importExecuter: importExecuter,
    };

  return (
    <Spin spinning={isImporting} tip="Importing...">
      <Form>
        <Dragger
          accept=".shaconfig"
          customRequest={onUploadRequest}
          listType="text"
          maxCount={1}
          itemRender={fileRender}
          className={styles.shaPackageUploadDrag}
          style={{ display: Boolean(uploadFile) ? "none" : undefined }}
          fileList={uploadFile ? [uploadFile] : []}
        >
          <p className={`${prefixCls}-upload-drag-icon`}>
            <InboxOutlined />
          </p>
          <p className={`${prefixCls}-upload-text`}>Click or drag <strong>.shaconfig</strong> file to this area to upload</p>
        </Dragger>
        {packageContent && (
          <PackageContent packageState={packageContent} onChangeSelection={onChangeSelection} />
        )}
      </Form>
    </Spin>
  );
};
