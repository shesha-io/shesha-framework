import { IStoredFile } from "./contexts";

export const removeFile = (fileIdToDelete: string, fileList = []): IStoredFile[] => {
  return fileList.filter(({ id, uid }) => id !== fileIdToDelete && uid !== fileIdToDelete);
};

export const addFile = (newFile: IStoredFile, fileList: IStoredFile[] = []): IStoredFile[] => {
  const found = fileList.some((file) => file.uid === newFile.uid);
  if (!found) {
    return [...fileList, { ...newFile, uid: newFile.id }];
  }
  return fileList.map((file) =>
    file.uid === newFile.uid
      ? { ...newFile, uid: newFile.id }
      : file,
  );
};

export const updateDownloadedAFile = (fileList: IStoredFile[], fileId: string): IStoredFile[] => fileList?.map((file) =>
  file.id === fileId || file.uid === fileId
    ? { ...file, userHasDownloaded: true }
    : file,
);

export const updateAllFilesDownloaded = (fileList: IStoredFile[]): IStoredFile[] => fileList?.map((file) => ({
  ...file,
  userHasDownloaded: true,
}));
