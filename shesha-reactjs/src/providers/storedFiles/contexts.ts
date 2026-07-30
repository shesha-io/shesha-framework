import { createNamedContext } from '@/utils/react';
import { DownloadFileArgs, FileListReference, ReplaceFilePayload, StoredFileModel } from '../../utils/storedFile/models';
import { SubscribeFunc } from '@/utils/subscriptions/subscriptionManager';
import { OnFileDownloaded, OnFileListChanged } from './models';

export type AttachmentsEditorEvents = 'fileList';

export interface IAttachmentsEditorActions {
  uploadFile: (args: { file: File }) => Promise<void>;
  replaceFile: (args: ReplaceFilePayload) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  downloadZipFile: () => Promise<void>;
  downloadFile: (args: DownloadFileArgs) => Promise<void>;

  init: (fileListReference: FileListReference) => void;
  setOnFileListChanged: (onChange: OnFileListChanged | undefined) => void;
  setOnFileDownloaded: (onFileDownloaded: OnFileDownloaded | undefined) => void;

  subscribe: SubscribeFunc<AttachmentsEditorEvents, IAttachmentsEditorActions>;
}

export interface IAttachmentsEditorState {
  readonly fileList: StoredFileModel[];
}

export type IAttachmentsEditorInstance = IAttachmentsEditorActions & IAttachmentsEditorState;

export const AttachmentsEditorContext = createNamedContext<IAttachmentsEditorInstance | undefined>(undefined, "AttachmentsEditorContext");
