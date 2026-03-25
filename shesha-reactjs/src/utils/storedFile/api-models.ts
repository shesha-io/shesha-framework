import { IEntityTypeIdentifierQueryParams } from "@/interfaces/metadata";
import { IEntityTypeIdentifier } from "../../providers/sheshaApplication/publicApi/entities/models";

export type DownloadFilePayload = {
  id: string;
  versionNo?: number | undefined;
};

export type DownloadZipByIdsPayload = {
  filesId: string[];
};

export type FilesListPayload = {
  /**
   * Id of the owner entity
   */
  ownerId: string;
  /**
   * Type of the owner entity
   */
  ownerType: IEntityTypeIdentifierQueryParams;
  /**
   * Property name of the owner entity. Is used for assign file to the nested entities
   */
  ownerName?: string | undefined;
  /**
   * Category of the file. Is used to split attachments into groups
   */
  filesCategory?: string | undefined;
};

export type GetFileInfoByReferencePayload = {
  /**
   * Id of the owner entity
   */
  ownerId: string;
  /**
   * Type of the owner entity
   */
  ownerType: IEntityTypeIdentifierQueryParams;
  /**
   * Property name of the owner entity
   */
  propertyName: string;
};

export type DeleteFileByReferencePayload = {
  /**
   * Id of the owner entity
   */
  ownerId: string;
  /**
   * Type of the owner entity
   */
  ownerType: string | IEntityTypeIdentifier;
  /**
   * Property name of the owner entity
   */
  propertyName: string;
};

export type StoredFileDto = {
  id: string;
  name: string;
  size: number;
  type: string | null;
  error: string | null;
  fileCategory: string | null;
  url: string;
  temporary: boolean;
  userHasDownloaded: boolean;
};

export type DownloadFileBase64Payload = {
  id: string;
  versionNo?: number | undefined;
};

export type DownloadFileBase64Response = {
  base64String: string;
};
