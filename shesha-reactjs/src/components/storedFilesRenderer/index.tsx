import React, { FC } from 'react';
import { StoredFilesRendererBase } from '@/components/storedFilesRendererBase';
import { useAttachmentsEditorActions, useAttachmentsEditorState } from '@/providers/storedFiles';
import { ButtonProps } from 'antd';

export interface IStoredFilesRendererProps {
  ownerId?: string;
  ownerType?: string;
  isDragger?: boolean;
  uploadBtnProps?: ButtonProps;
  disabled?: boolean;
  accept?: string[];
  layout?: 'vertical' | 'horizontal' | 'grid';
  listType?: 'text' | 'thumbnail';
}

export const StoredFilesRenderer: FC<IStoredFilesRendererProps> = ({
  ownerId,
  ownerType,
  isDragger,
  uploadBtnProps,
  disabled,
  accept = [],
  layout,
  listType,
}) => {
  const {
    deleteFile,
    uploadFile,
    replaceFile,
    downloadZipFile,
    downloadFile,
    // isInProgress,
    // succeeded,
  } = useAttachmentsEditorActions();
  const fileList = useAttachmentsEditorState();

  return (
    <StoredFilesRendererBase
      ownerId={ownerId}
      ownerType={ownerType}
      fileList={fileList}
      uploadFile={uploadFile}
      replaceFile={replaceFile}
      deleteFile={deleteFile}
      downloadZipFile={downloadZipFile}
      downloadFile={downloadFile}
      // isDownloadingFileListZip={isInProgress?.downloadZip}
      // isDownloadZipSucceeded={succeeded?.downloadZip}
      isDragger={isDragger}
      uploadBtnProps={uploadBtnProps}
      disabled={disabled}
      allowedFileTypes={accept}
      layout={layout}
      listType={listType}
    // noFilesCaption={noFilesCaption}
    />
  );
};

export default StoredFilesRenderer;
