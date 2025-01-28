import React, { FC, useEffect } from 'react';
import { IUploadFilePayload, IStoredFile } from '@/providers/storedFiles/contexts';
import { StoredFilesRendererBase } from '@/components/';
import { IInputStyles, useSheshaApplication, useStoredFilesStore } from '@/providers';
import { layoutType, listType } from '@/designer-components/attachmentsEditor/attachmentsEditor';

export interface ICustomFileProps extends IInputStyles {
  uploadFile?: (payload: IUploadFilePayload) => void;
  onFileListChanged?: (list: IStoredFile[]) => void;
  allowAdd?: boolean;
  allowReplace?: boolean;
  allowDelete?: boolean;
  allowRename?: boolean;
  isStub?: boolean;
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

  // Customizations
  useEffect(() => {
    if (props?.onFileListChanged) props?.onFileListChanged(fileList);
  }, [fileList]);

  return (
    <div className="stored-files-renderer-wrapper">
      <StoredFilesRendererBase
        isStub={props.isStub}
        disabled={!props.allowAdd}
        isDragger={props?.isDragger}
        fileList={fileList?.map(({ url, ...rest }) => ({ url: `${backendUrl}${url}`, ...rest }))}
        allowUpload={false}
        allowDelete={props.allowDelete}
        deleteFile={deleteFile}
        uploadFile={props.uploadFile ?? uploadFile}
        downloadZipFile={downloadZipFile}
        downloadZip={props.downloadZip}
        downloadFile={downloadFile}
        isDownloadingFileListZip={downloadZip}
        isDownloadZipSucceeded={downloadZipSuccess}
        allowedFileTypes={props?.allowedFileTypes}
        maxHeight={props?.maxHeight}
        layout={props?.layout}
        listType={props?.listType}
        {...props}
      />
    </div>
  );
};

export default CustomFile;
