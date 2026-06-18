import React, { CSSProperties, FC } from 'react';
import { IconType, StoredFilesRendererBase } from '@/components/';
import { IInputStyles, IStyleType, useAttachmentsEditorActions, useAttachmentsEditorState } from '@/providers';
import { layoutType, listType } from '@/designer-components/attachmentsEditor/attachmentsEditor';
import { FormIdentifier } from '@/providers/form/models';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';

// TODO V1: review all properties and remove unused ones
export interface ICustomFileProps extends IInputStyles {
  id?: string | undefined;
  ownerId?: string | undefined;
  maxCount?: number | undefined;
  allowAdd?: boolean | undefined;
  allowReplace?: boolean | undefined;
  allowDelete?: boolean | undefined;
  allowRename?: boolean | undefined;
  allowViewHistory?: boolean | undefined;
  customActions?: ButtonGroupItemProps[] | undefined;
  hasExtraContent?: boolean | undefined;
  extraFormSelectionMode?: 'name' | 'dynamic' | undefined;
  extraFormId?: FormIdentifier | undefined;
  extraFormType?: string | undefined;
  isStub?: boolean | undefined;
  disabled?: boolean | undefined;
  allowedFileTypes?: string[] | undefined;
  maxHeight?: string | undefined;
  isDragger?: boolean | undefined;
  downloadZip?: boolean | undefined;
  filesLayout?: layoutType | undefined;
  listType?: listType | undefined;
  thumbnailWidth?: string | undefined;
  thumbnailHeight?: string | undefined;
  borderRadius?: number | undefined;
  hideFileName?: boolean | undefined;
  container?: IStyleType | undefined;
  primaryColor?: string | undefined;
  enableStyleOnReadonly?: boolean | undefined;
  downloadedFileStyles?: CSSProperties | undefined;
  styleDownloadedFiles?: boolean | undefined;
  downloadedIcon?: IconType | undefined;
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
      allowUpload={props.allowAdd ?? false}
      allowDelete={props.allowDelete ?? false}
      allowViewHistory={props.allowViewHistory ?? false}
      allowReplace={props.allowReplace ?? false}
      allowDownloadZip={props.downloadZip ?? false}
      allowedFileTypes={props.allowedFileTypes}

      customActions={props.customActions}
      maxHeight={props.maxHeight}
      layout={props.filesLayout ?? "vertical"}
      listType={props.listType ?? "text"}

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
    />
  );
};

export default CustomFile;
