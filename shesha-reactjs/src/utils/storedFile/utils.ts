import { isNullOrWhiteSpace } from "@/utils/nullables";
import { FileListReference, FileReference, StoredFileModel } from "./models";
import { isEntityTypeIdEmpty } from "../../providers/metadataDispatcher/entities/utils";
import { StoredFileDto } from "./api-models";
import { ownerTypeToString } from "../entity";

export const validateFileReference = (fileReference: FileReference): void => {
  if (isNullOrWhiteSpace(fileReference.ownerId))
    throw new Error('ownerId is required');
  if (isEntityTypeIdEmpty(fileReference.ownerType))
    throw new Error('ownerType is required');
  if (isNullOrWhiteSpace(fileReference.propertyName))
    throw new Error('propertyName is required');
};

export const isFileReferenceValid = (fileReference: FileReference): boolean => {
  try {
    validateFileReference(fileReference);
    return true;
  } catch {
    return false;
  }
};

export const fileListRefToString = (ref: FileListReference): string => `${ref.ownerId.toLowerCase()}_${ownerTypeToString(ref.ownerType)}_${ref.ownerName}_${ref.filesCategory?.toLowerCase()}`;

export const fileListReferenceEqual = (ref1: FileListReference, ref2: FileListReference): boolean => {
  return fileListRefToString(ref1) === fileListRefToString(ref2);
};


export const storedFileDtoToModel = (dto: StoredFileDto): StoredFileModel => {
  return {
    uid: dto.id,
    status: isNullOrWhiteSpace(dto.error) ? 'done' : 'error',
    error: dto.error,
    id: dto.id,
    name: dto.name,
    type: dto.type,
    size: dto.size,
    fileCategory: dto.fileCategory,
    url: dto.url,
    temporary: dto.temporary,
    userHasDownloaded: dto.userHasDownloaded,
  } satisfies StoredFileModel;
};

export const getFileExtension = (file: File): string => {
  return file.name.split('.').pop() || '';
};
