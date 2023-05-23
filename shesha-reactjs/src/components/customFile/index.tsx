import React, { FC, useEffect } from 'react';
import { IUploadFilePayload, IStoredFile } from '../../providers/storedFiles/contexts';
import { StoredFilesRendererBase } from '../';
import { useSheshaApplication, useStoredFilesStore } from '../../providers';

export interface ICustomFileProps {
  uploadFile?: (payload: IUploadFilePayload) => void;
  onFileListChanged?: (list: IStoredFile[]) => void;
  allowAdd?: boolean;
  allowReplace?: boolean;
  allowDelete?: boolean;
  allowRename?: boolean;
  isStub?: boolean;
  allowedFileTypes?: string[];
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
        isDragger={false}
        fileList={fileList.map(({ url, ...rest }) => ({ url: `${backendUrl}${url}`, ...rest }))}
        allowUpload={false}
        //downloadFile={downloadFile}
        deleteFile={deleteFile}
        uploadFile={props.uploadFile ?? uploadFile}
        downloadZipFile={downloadZipFile}
        downloadFile={downloadFile}
        isDownloadingFileListZip={downloadZip}
        isDownloadZipSucceeded={downloadZipSuccess}
        allowedFileTypes={props?.allowedFileTypes}
      />
    </div>
  );
};

export default CustomFile;
