export const removeFile = (fileIdToDelete, fileList = []) => {
  return fileList.filter(({ id, uid }) => id !== fileIdToDelete && uid !== fileIdToDelete);
};

export const addFile = (newFile, fileList = []) => {
  const found = fileList.some((file) => file.uid === newFile.uid);
  if (!found) {
    return [...fileList, { ...newFile, uid: newFile.id }];
  }
  return fileList.map((file) =>
    file.uid === newFile.uid
      ? { ...newFile, uid: newFile.id }
      : file
  );
};

export const updateDownloadedAFile = (fileList, fileId) => fileList?.map((file) =>
  file.id === fileId || file.uid === fileId
    ? { ...file, userHasDownloaded: true }
    : file
);

export const updateAllFilesDownloaded = (fileList) => fileList?.map((file) => ({
  ...file,
  userHasDownloaded: true,
}));
