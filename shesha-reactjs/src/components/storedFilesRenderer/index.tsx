import React, { FC, ReactNode } from 'react';
import { StoredFilesRendererBase } from '@/components/storedFilesRendererBase';
import { useStoredFilesStore } from '@/providers/storedFiles';
import { ButtonProps } from 'antd';
import { IStoredFile } from '@/index';

export interface IStoredFilesRendererProps {
  ownerId?: string;
  ownerType?: string;
  isDragger?: boolean;
  uploadBtnProps?: ButtonProps;
  disabled?: boolean;
  noFilesCaption?: ReactNode;
  accept?: string[];
  layout?: 'vertical' | 'horizontal' | 'grid';
  listType?: 'text' | 'thumbnail';
  onFileListChanged?: (list: IStoredFile[]) => void;
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
  onFileListChanged,
}) => {
  const {
    fileList,
    deleteFile,
    uploadFile: uploadFileRequest,
    downloadZipFile,
    downloadFile,
    isInProgress,
    succeeded,
  } = useStoredFilesStore();

  return (
    <StoredFilesRendererBase
      ownerId={ownerId}
      ownerType={ownerType}
      fileList={fileList}
      uploadFile={uploadFileRequest}
      deleteFile={deleteFile}
      downloadZipFile={downloadZipFile}
      downloadFile={downloadFile}
      isDownloadingFileListZip={isInProgress && isInProgress.dowloadZip}
      isDownloadZipSucceeded={succeeded && succeeded.dowloadZip}
      isDragger={isDragger}
      uploadBtnProps={uploadBtnProps}
      disabled={disabled}
      allowedFileTypes={accept}
      layout={layout}
      listType={listType}
      onFileListChanged={onFileListChanged}
    // noFilesCaption={noFilesCaption}
    />
  );
};

export default StoredFilesRenderer;
