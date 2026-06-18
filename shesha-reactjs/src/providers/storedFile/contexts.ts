import { createNamedContext } from '@/utils/react';
import { StoredFileModel } from '../../utils/storedFile/models';
import { DownloadFileArgs, FileUploadMode, OnFileUploadChanged, UploadFileArgs } from './models';
import { IEntityTypeIdentifier } from '../sheshaApplication/publicApi/entities/models';
import { SubscribeFunc } from '../../utils/subscriptions/subscriptionManager';
import { FileUploadEvents } from './instance';

export interface IStoredFileStateContext {
  fileInfo: StoredFileModel | undefined;
}

export type FileUploadInitArgs = {
  ownerId?: string | undefined;
  ownerType?: string | IEntityTypeIdentifier | undefined;
  propertyName?: string | undefined;
  fileId?: string | undefined;
  uploadMode: FileUploadMode;
};

export interface IFileUpload {
  fileInfo: StoredFileModel | undefined;

  downloadFile: (payload: DownloadFileArgs) => Promise<void>;
  uploadFile: (payload: UploadFileArgs) => Promise<void>;
  deleteFile: () => Promise<void>;
  fetchFileInfo: () => Promise<void>;

  init: (args: FileUploadInitArgs) => void;
  setOnChange: (onChange: OnFileUploadChanged | undefined) => void;
  subscribe: SubscribeFunc<FileUploadEvents, IFileUpload>;
};

export const FileUploadContext = createNamedContext<IFileUpload | undefined>(undefined, "FileUploadContext");
