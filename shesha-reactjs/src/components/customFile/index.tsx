import React, { FC, } from 'react';
import { IUploadFilePayload, IStoredFile } from '@/providers/storedFiles/contexts';
import { StoredFilesRendererBase } from '@/components/';
import { IInputStyles, useSheshaApplication, useStoredFilesStore } from '@/providers';
import { layoutType, listType } from '@/designer-components/attachmentsEditor/attachmentsEditor';

export interface ICustomFileProps extends IInputStyles {
  id?: string;
  ownerId?: string;
  uploadFile?: (payload: IUploadFilePayload) => void;
  onFileListChanged?: (list: IStoredFile[]) => void;
  allowAdd?: boolean;
  allowReplace?: boolean;
  allowDelete?: boolean;
  allowRename?: boolean;
  isStub?: boolean;
  disabled?: boolean;
  allowedFileTypes?: string[];
  maxHeight?: string;
  isDragger?: boolean;
  downloadZip?: boolean;
  layout?: layoutType;
  listType?: listType;
  thumbnailWidth?: string;
  thumbnailHeight?: string;
  borderRadius?: number;
  hideFileName?: boolean;
}

export const CustomFile: FC<ICustomFileProps> = (props) => {
  const {
    fileList,
    //downloadFile,
    deleteFile,
    uploadFile,
    downloadZipFile,
    downloadFile,
    isInProgress: { downloadZip },
    succeeded: { downloadZip: downloadZipSuccess },
  } = useStoredFilesStore();

  const { backendUrl } = useSheshaApplication();

  return (
    <div className="stored-files-renderer-wrapper">
      <StoredFilesRendererBase
        {...props}
        isStub={props.isStub}
        disabled={props.disabled || !props.allowAdd}
        isDragger={props?.isDragger}
        fileList={fileList?.map(({ url, ...rest }) => ({ url: `${backendUrl}${url}`, ...rest }))}
        allowUpload={false}
        allowDelete={props.allowDelete}
        deleteFile={deleteFile}
        uploadFile={props.uploadFile ?? uploadFile}
        downloadZipFile={downloadZipFile}
        downloadZip={props.downloadZip}
        downloadFile={downloadFile}
        onFileListChanged={props.onFileListChanged}
        isDownloadingFileListZip={downloadZip}
        isDownloadZipSucceeded={downloadZipSuccess}
        allowedFileTypes={props?.allowedFileTypes}
        maxHeight={props?.maxHeight}
        layout={props?.layout}
        listType={props?.listType}
      />
    </div>
  );
};

export default CustomFile;
