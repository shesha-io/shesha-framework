import { IStoredFile } from "@/index";

export const removeFile = (fileList: IStoredFile[] = [], fileIdToDelete: string): IStoredFile[] => {
    return fileList.filter(({ id, uid }) => id !== fileIdToDelete && uid !== fileIdToDelete);
};

export const addFile = (newFile: IStoredFile, fileList: IStoredFile[] = []): IStoredFile[] => {
  const found = fileList.some((file) => file.uid === newFile.uid);
  if (!found) {
    return [...fileList, { ...newFile, uid: newFile.id ?? newFile.uid }];
  }
  return fileList.map((file) =>
    file.uid === newFile.uid
  ? { ...newFile, uid: newFile.id ?? newFile.uid }
      : file
  );
};

export const updateDownloadedAFile = (fileList: IStoredFile[] | undefined, fileId: string): IStoredFile[] | undefined => fileList?.map((file) =>
  file.id === fileId || file.uid === fileId
    ? { ...file, userHasDownloaded: true }
    : file
);

export const updateAllFilesDownloaded = (fileList: IStoredFile[] | undefined): IStoredFile[] | undefined => fileList?.map((file) => ({
  ...file,
  userHasDownloaded: true,
}));

/**
 * Normalizes file extension to lowercase to avoid case sensitivity issues on Linux
 * @param file - The file to normalize
 * @returns A new File object with normalized extension
 */
export const normalizeFileName = (file: File): File => {
  const lastDotIndex = file.name.lastIndexOf('.');
  const fileName = lastDotIndex === -1
    ? file.name
    : file.name.substring(0, lastDotIndex) + file.name.substring(lastDotIndex).toLowerCase();

  return new File([file], fileName, { type: file.type });
};