export type OnFileChanged = (value: string | File | null) => void;

export type FileUploadMode = 'async' | 'sync';

export type DownloadFileArgs = {
  fileId: string;
  versionNo?: number | undefined;
  fileName?: string | undefined;
};

export type UploadFileArgs = {
  file: File;
};

export type FileUploadValue = File | string | null;

export type OnFileUploadChanged = (value: FileUploadValue) => void;
