import { StoredFileModel } from "@/utils/storedFile/models";

export type OnFileListChanged = (fileList: StoredFileModel[], isUserAction?: boolean) => void;
export type OnFileDownloaded = (fileList: StoredFileModel[], isUserAction?: boolean) => void;

/** The four things a user can do to a file. Each one has its own handler on the Events tab. */
export type FileAction = 'upload' | 'download' | 'replace' | 'delete';

/**
 * One callback for all four, rather than a slot each: the component dispatches on `action`, so a
 * new action costs a case rather than another setter, prop and field.
 *
 * `file` is the file the action happened to — the uploaded one, the new version after a replace,
 * the one just removed. It is undefined only for a zip download, which has no single subject, and
 * `fileList` is always the list as it stands afterwards.
 */
export type OnFileAction = (action: FileAction, fileList: StoredFileModel[], file?: StoredFileModel | undefined) => void;
