import React, { CSSProperties, FC } from 'react';
import { IUploadFilePayload } from '@/providers/storedFiles/contexts';
import { IconType, StoredFilesRendererBase } from '@/components/';
import { IInputStyles, IStyleType, useSheshaApplication, useStoredFilesStore } from '@/providers';
import { IAttachmentContent, layoutType, listType } from '@/designer-components/attachmentsEditor/attachmentsEditor';
import { FormIdentifier } from '@/providers/form/models';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';

export interface ICustomFileProps extends IInputStyles {
  id?: string;
  ownerId?: string;
  uploadFile?: (payload: IUploadFilePayload) => void;
  maxCount?: number;
  allowAdd?: boolean;
  allowReplace?: boolean;
  allowDelete?: boolean;
  allowRename?: boolean;
  allowViewHistory?: boolean;
  customActions?: ButtonGroupItemProps[];
  hasExtraContent?: boolean;
  extraContent?: IAttachmentContent;
  extraFormSelectionMode?: 'name' | 'dynamic';
  extraFormId?: FormIdentifier;
  extraFormType?: string;
  isStub?: boolean;
  disabled?: boolean;
  allowedFileTypes?: string[];
  maxHeight?: string;
  isDragger?: boolean;
  downloadZip?: boolean;
  filesLayout?: layoutType;
  listType?: listType;
  thumbnailWidth?: string;
  thumbnailHeight?: string;
  borderRadius?: number;
  hideFileName?: boolean;
  container?: IStyleType;
  primaryColor?: string;
  enableStyleOnReadonly?: boolean;
  downloadedFileStyles?: CSSProperties;
  styleDownloadedFiles?: boolean;
  downloadedIcon?: IconType;
}

export const CustomFile: FC<ICustomFileProps> = (props) => {
  const {
    fileList,
    // downloadFile,
    deleteFile,
    uploadFile,
    replaceFile,
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
        allowViewHistory={props.allowViewHistory}
        customActions={props.customActions}
        allowReplace={props.allowReplace}
        uploadFile={props.uploadFile ?? uploadFile}
        replaceFile={replaceFile}
        downloadZipFile={downloadZipFile}
        downloadZip={props.downloadZip}
        downloadFile={downloadFile}
        isDownloadingFileListZip={downloadZip}
        isDownloadZipSucceeded={downloadZipSuccess}
        allowedFileTypes={props?.allowedFileTypes}
        maxHeight={props?.maxHeight}
        layout={props?.filesLayout}
        listType={props?.listType}
        hasExtraContent={props.hasExtraContent}
        extraContent={props.extraContent}
        extraFormSelectionMode={props.extraFormSelectionMode}
        extraFormId={props.extraFormId}
        extraFormType={props.extraFormType}
        downloadedFileStyles={props?.downloadedFileStyles}
        styleDownloadedFiles={props?.styleDownloadedFiles}
        downloadedIcon={props?.downloadedIcon}
      />
    </div>
  );
};

export default CustomFile;
