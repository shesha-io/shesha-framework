import React, { CSSProperties, FC } from 'react';
import { IconType, StoredFilesRendererBase } from '@/components/';
import { IInputStyles, IStyleType, useAttachmentsEditorActions, useAttachmentsEditorState } from '@/providers';
import { layoutType, listType } from '@/designer-components/attachmentsEditor/attachmentsEditor';
import { FormIdentifier } from '@/providers/form/models';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';

// TODO V1: review all properties and remove unused ones
export interface ICustomFileProps extends IInputStyles {
  id?: string;
  ownerId?: string;
  maxCount?: number;
  allowAdd?: boolean;
  allowReplace?: boolean;
  allowDelete?: boolean;
  allowRename?: boolean;
  allowViewHistory?: boolean;
  customActions?: ButtonGroupItemProps[];
  hasExtraContent?: boolean;
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
    deleteFile,
    uploadFile,
    replaceFile,
    downloadZipFile,
    downloadFile,
  } = useAttachmentsEditorActions();
  const files = useAttachmentsEditorState();

  return (
    <StoredFilesRendererBase
      {...props}
      isStub={props.isStub}
      isDragger={props.isDragger}

      disabled={props.disabled || !props.allowAdd}
      allowUpload={props.allowAdd}
      allowDelete={props.allowDelete}
      allowViewHistory={props.allowViewHistory}
      allowReplace={props.allowReplace}
      allowDownloadZip={props.downloadZip}
      allowedFileTypes={props.allowedFileTypes}

      customActions={props.customActions}
      maxHeight={props.maxHeight}
      layout={props.filesLayout}
      listType={props.listType}

      hasExtraContent={props.hasExtraContent}
      extraFormSelectionMode={props.extraFormSelectionMode}
      extraFormId={props.extraFormId}
      extraFormType={props.extraFormType}

      downloadedFileStyles={props.downloadedFileStyles}
      styleDownloadedFiles={props.styleDownloadedFiles}
      downloadedIcon={props.downloadedIcon}

      fileList={files}
      uploadFile={uploadFile}
      replaceFile={replaceFile}
      deleteFile={deleteFile}
      downloadZipFile={downloadZipFile}
      downloadFile={downloadFile}
      // isDownloadingFileListZip={downloadZip}
      // isDownloadZipSucceeded={downloadZipSuccess}
    />
  );
};

export default CustomFile;
