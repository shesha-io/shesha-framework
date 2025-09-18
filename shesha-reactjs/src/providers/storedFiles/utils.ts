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
}));

// Transform file data to include uid property
export const fileReducer = (data) => {
    return { ...data, uid: data.id };
};

export const filesReducer = (data = []) => data?.map((file) => fileReducer(file));

// Replace file in list by UID
export const replaceFileByUid = (fileList, updatedFile) => {
    return fileList.map((file) => {
        if (file.uid === updatedFile.uid) {
            return updatedFile;
        }
        return file;
    });
};

// Add file to beginning of list if it doesn't already exist
export const addFileToList = (fileList, newFile) => {
    const foundFile = fileList.find(({ id }) => id === newFile.id);
    if (foundFile) {
        return fileList; // File already exists, no change
    }
    return [newFile, ...fileList];
};

// Find file in list by id or uid
export const findFile = (fileList, fileIdentifier) => {
    return fileList?.find(({ id, uid }) => id === fileIdentifier || uid === fileIdentifier);
};