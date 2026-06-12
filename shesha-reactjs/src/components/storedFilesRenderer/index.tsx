import React, { FC } from 'react';
import { StoredFilesRendererBase } from '@/components/storedFilesRendererBase';
import { useAttachmentsEditorActions, useAttachmentsEditorState } from '@/providers/storedFiles';
import { ButtonProps } from 'antd';

export interface IStoredFilesRendererProps {
  ownerId?: string | undefined;
  ownerType?: string | undefined;
  isDragger?: boolean | undefined;
  uploadBtnProps?: ButtonProps | undefined;
  disabled?: boolean | undefined;
  accept?: string[] | undefined;
  layout?: 'vertical' | 'horizontal' | 'grid' | undefined;
  listType?: 'text' | 'thumbnail' | undefined;
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
      isDragger={isDragger}
      uploadBtnProps={uploadBtnProps}
      disabled={disabled}
      allowedFileTypes={accept}
      layout={layout ?? "vertical"}
      listType={listType ?? "text"}
    />
  );
};

export default StoredFilesRenderer;
