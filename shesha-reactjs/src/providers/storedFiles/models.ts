import { StoredFileModel } from "@/utils/storedFile/models";

export type OnFileListChanged = (fileList: StoredFileModel[], isUserAction?: boolean) => void;
export type OnFileDownloaded = (fileList: StoredFileModel[], isUserAction?: boolean) => void;
