import { IEntityTypeIdentifier } from "../../providers/sheshaApplication/publicApi/entities/models";
import { OwnerEntityReference } from "@/interfaces/entity";

export const STORED_FILE_URLS = {
  GET_FILE_INFO_BY_ID: "/api/StoredFile",
  GET_FILE_INFO_BY_REFERENCE: "/api/StoredFile/EntityProperty",
  UPLOAD_FILE: "/api/StoredFile",
  UPLOAD_FILE_AS_ATTACHMENT: "/api/StoredFile/Upload",
  REPLACE_FILE: "/api/StoredFile/UploadNewVersion",
  DELETE_FILE_BY_ID: "/api/StoredFile",
  DELETE_FILE_BY_REFERENCE: "/api/StoredFile/Delete",
  FILES_LIST: "/api/StoredFile/FilesList",
  DOWNLOAD_FILE: "/api/StoredFile/Download",
  DOWNLOAD_FILE_BASE64: "/api/StoredFile/Base64String",
  DOWNLOAD_ZIP: "/api/StoredFile/DownloadZip",
};

/**
 * Represents a reference to a list of files on backend
 */
export type FileListReference = OwnerEntityReference & {
  /**
   * Property name of the owner entity. Is used for assign file to the nested entities
   */
  ownerName?: string | undefined;
  /**
   * Category of the file. Is used to split attachments into groups
   */
  filesCategory?: string | undefined;
};

export type FileReference = OwnerEntityReference & {
  fileId?: string | undefined;
  propertyName: string;
};

export type DownloadFileArgs = {
  fileId: string;
  versionNo?: number | undefined;
  fileName?: string | undefined;
};

export type DeleteFileArgs = {
  id: string;
};

export type UploadFileAsAttachmentArgs = {
  file: File;
  ownerId?: string | undefined;
  ownerType?: string | IEntityTypeIdentifier | undefined;
  ownerName?: string | undefined;
  filesCategory?: string | undefined;
};

export type UploadFileArgs = {
  file: File;
  id: string | undefined;
  ownerId: string | undefined;
  ownerType: string | IEntityTypeIdentifier | undefined;
  propertyName: string | undefined;
};

export type ReplaceFilePayload = {
  fileId: string;
  file: File;
};

export type DownloadZipByOwnerArgs = {
  ownerId: string;
  ownerType: string | IEntityTypeIdentifier;
  filesCategory: string | undefined;
  ownerName: string | undefined;
};

export type DownloadZipByIdsArgs = {
  filesId: string[];
};

export type UploadFileStatus = 'error' | 'done' | 'uploading' | 'removed';

export type StoredFileModel = {
  uid: string;
  size?: number;
  name: string;
  status?: UploadFileStatus;
  type: string | null;

  error?: string | null;
  id?: string | null;
  fileCategory: string | null;
  url: string | null;
  temporary: boolean;
  userHasDownloaded: boolean;
};
