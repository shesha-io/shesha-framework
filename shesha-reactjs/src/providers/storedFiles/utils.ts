export const removeFile = (fileList = [], fileIdToDelete) => {
    return fileList.filter(({ id, uid }) => id !== fileIdToDelete && uid !== fileIdToDelete);
}

export const updateDownloadedAFile = (fileList, fileId) => fileList?.map(file =>
    file.id === fileId || file.uid === fileId
        ? { ...file, userHasDownloaded: true }
        : file
);

export const updateAllFilesDownloaded = (fileList) => fileList?.map(file => ({
    ...file,
    userHasDownloaded: true
}))