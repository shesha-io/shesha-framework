export const removeFile = (fileIdToDelete, fileList = []) => {
  return fileList.filter(({ id, uid }) => id !== fileIdToDelete && uid !== fileIdToDelete);
};

export const addFile = (newFile, fileList = []) => fileList.map((file) => {
  if (file.uid === newFile.uid) {
    return {
      ...newFile,
      uid: newFile.id, // We want to reset the uid to the id because we use it to delete the file
    };
  } else {
    return file;
  }
});

export const updateDownloadedAFile = (fileList, fileId) => fileList?.map((file) =>
  file.id === fileId || file.uid === fileId
    ? { ...file, userHasDownloaded: true }
    : file
);

export const updateAllFilesDownloaded = (fileList) => fileList?.map((file) => ({
  ...file,
  userHasDownloaded: true,
}));
