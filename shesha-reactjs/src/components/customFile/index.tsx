import { CSSProperties, FC } from 'react';
import { IconType, StoredFilesRendererBase } from '@/components/';
import { IStoredFilesClassNames } from '@/components/storedFilesRendererBase';
import { IInputStyles, IStyleValue, useAttachmentsEditorActions, useAttachmentsEditorFetchError, useAttachmentsEditorState } from '@/providers';
import { LayoutType, ListType } from '@/designer-components/attachmentsEditor/attachmentsEditor';
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
  filesLayout?: LayoutType | undefined;
  listType?: ListType | undefined;
  thumbnailWidth?: string | undefined;
  thumbnailHeight?: string | undefined;
  borderRadius?: number | undefined;
  hideFileName?: boolean | undefined;
  /** Replaces the drop area's stock prompt, and its hint, when the list is a dragger. */
  dropzoneText?: string | undefined;
  /** Shown in place of the list when there is nothing to show and nothing can be added. */
  emptyText?: string | undefined;
  container?: IStyleValue | undefined;
  /** Style set for the thumbnail image box. Read directly for sizes CSS cannot supply. */
  thumbnailStyle?: IStyleValue | undefined;
  /** The nested `thumbnailStyle.style` script already evaluated to CSS. */
  thumbnailStyleCss?: CSSProperties | undefined;
  primaryColor?: string | undefined;
  enableStyleOnReadonly?: boolean | undefined;
  downloadedFileStyles?: CSSProperties | undefined;
  styleDownloadedFiles?: boolean | undefined;
  downloadedIcon?: IconType | undefined;
  /**
   * Class names for the parts of the list that the component styles from its Appearance tab.
   * The popup ones matter most: antd portals popovers to the body, so no descendant selector from
   * the list's own class can reach them and each has to be handed its class explicitly.
   */
  classNames?: IStoredFilesClassNames | undefined;
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
  const fetchFilesError = useAttachmentsEditorFetchError();

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

      dropzoneText={props.dropzoneText}
      emptyText={props.emptyText}

      hasExtraContent={props.hasExtraContent}
      extraFormSelectionMode={props.extraFormSelectionMode}
      extraFormId={props.extraFormId}
      extraFormType={props.extraFormType}

      thumbnailStyle={props.thumbnailStyle}
      thumbnailStyleCss={props.thumbnailStyleCss}
      downloadedFileStyles={props.downloadedFileStyles}
      styleDownloadedFiles={props.styleDownloadedFiles}
      downloadedIcon={props.downloadedIcon}
      classNames={props.classNames}

      fileList={files}
      fetchFilesError={fetchFilesError}
      uploadFile={uploadFile}
      replaceFile={replaceFile}
      deleteFile={deleteFile}
      downloadZipFile={downloadZipFile}
      downloadFile={downloadFile}
    />
  );
};

export default CustomFile;
