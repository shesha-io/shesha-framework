import { DownloadFileArgs, FileListReference, ReplaceFilePayload, StoredFileModel, UploadFileAsAttachmentArgs } from "../../utils/storedFile/models";
import { HttpClientApi } from "@/publicJsApis/apis/httpClient";
import { IStoredFileHelper, StoredFileHelper } from "../../utils/storedFile/storedFileHelper";
import { extractErrorMessage } from "@/utils/errors";
import { MessageInstance } from 'antd/es/message/interface';
import { DelayedUpdateClient } from "../delayedUpdateProvider/context";
import { STORED_FILES_DELAYED_UPDATE } from "../delayedUpdateProvider/models";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { nanoid } from "@/utils/uuid";
import { SubscribeFunc, SubscriptionManager } from "@/utils/subscriptions/subscriptionManager";
import { AttachmentsEditorEvents, IAttachmentsEditorInstance } from "./contexts";
import { fileListReferenceEqual, getFileExtension, storedFileDtoToModel } from "@/utils/storedFile/utils";
import { OnFileDownloaded, OnFileListChanged } from "./models";
import { isOwnerReferenceValid } from "@/utils/entity";
import { isEntityTypeIdEmpty } from "../metadataDispatcher/entities/utils";
import { isFile } from "@/utils/fileValidation";

export type StoredFilesProcessorArgs = {
  httpClient: HttpClientApi;
  message: MessageInstance;
  delayedUpdateClient: DelayedUpdateClient | undefined;
};

export class AttachmentsEditorInstance implements IAttachmentsEditorInstance {
  #fileListReference: FileListReference | undefined;

  #fileList: StoredFileModel[] = [];

  #message: MessageInstance;

  #fileHelper: IStoredFileHelper;

  #delayedUpdateClient: DelayedUpdateClient | undefined;

  #onChange: OnFileListChanged | undefined;

  #onFileDownloaded: OnFileDownloaded | undefined;

  #subscriptionManager: SubscriptionManager<AttachmentsEditorEvents, IAttachmentsEditorInstance>;

  constructor(args: StoredFilesProcessorArgs) {
    this.#message = args.message;
    this.#delayedUpdateClient = args.delayedUpdateClient;
    this.#fileHelper = new StoredFileHelper(args.httpClient);
    this.#subscriptionManager = new SubscriptionManager<AttachmentsEditorEvents, IAttachmentsEditorInstance>();
  }

  subscribe: SubscribeFunc<AttachmentsEditorEvents, IAttachmentsEditorInstance> = (type, callback) => {
    return this.#subscriptionManager.subscribe(type, callback);
  };

  notifySubscribers = (types: AttachmentsEditorEvents[]): void => this.#subscriptionManager.notifySubscribers(types, this);

  get fileList(): StoredFileModel[] {
    return this.#fileList;
  };

  private fetchFilesList = async (): Promise<void> => {
    if (!isDefined(this.#fileListReference))
      throw new Error('File list reference is not defined');

    const files = await this.#fileHelper.fetchFilesListAsync(this.#fileListReference);
    this.#fileList = files.map((file) => storedFileDtoToModel(file));
    try {
      this.notifySubscribers(['fileList']);
    } catch (error) {
      console.error('AttachmentsEditorInstance.notifySubscribers failed', error);
    }
  };

  init = (fileListReference: FileListReference): void => {
    // skip initialization if it is already initialized with the same reference
    if (isDefined(this.#fileListReference) && fileListReferenceEqual(this.#fileListReference, fileListReference))
      return;

    this.#fileListReference = fileListReference;
    if (isOwnerReferenceValid(this.#fileListReference))
      void this.fetchFilesList();
  };

  setOnFileListChanged = (onChange: OnFileListChanged | undefined): void => {
    this.#onChange = onChange;
  };

  setOnFileDownloaded = (onFileDownloaded: OnFileDownloaded | undefined): void => {
    this.#onFileDownloaded = onFileDownloaded;
  };

  private updateFileList = (updater: (files: StoredFileModel[]) => StoredFileModel[]): void => {
    this.#fileList = updater(this.#fileList);
    this.notifySubscribers(['fileList']);
  };

  private addFileToList = (file: StoredFileModel): void => {
    this.updateFileList((files) => [...files, file]);
  };

  private updateFileByUid = (uid: string, updater: (file: StoredFileModel) => StoredFileModel): void => {
    this.updateFileList((files) => files.map((f) => (f.uid === uid ? updater(f) : f)));
  };

  /**
   * Normalizes file identifier to handle both persisted IDs and temporary UIDs.
   * When a file is first uploaded, it has only a uid. After server persistence, it gets an id.
   * Callers may pass file.id || file.uid, so we need to find the file by matching either.
   * @param fileId - The file identifier (could be persisted id or temporary uid)
   * @returns The file matching the identifier, or undefined if not found
   */
  private findFileById = (fileId: string): StoredFileModel | undefined => {
    return this.#fileList.find((f) => f.id === fileId || f.uid === fileId);
  };

  /**
   * Updates a file by its id (persisted) or uid (temporary).
   * This handles cases where callers pass file.id || file.uid.
   */
  private updateFileByIdOrUid = (fileId: string, updater: (file: StoredFileModel) => StoredFileModel): void => {
    this.updateFileList((files) => files.map((f) => (f.id === fileId || f.uid === fileId ? updater(f) : f)));
  };

  uploadFile = async (args: UploadFileAsAttachmentArgs): Promise<void> => {
    const fileUid = nanoid();
    try {
      // Merge args with stored file list reference to ensure all owner properties are included
      // Use provided values, but fall back to stored reference for missing/empty values
      const uploadArgs: UploadFileAsAttachmentArgs = {
        file: args.file,
        ownerId: !isNullOrWhiteSpace(args.ownerId) ? args.ownerId : this.#fileListReference?.ownerId,
        ownerType: !isEntityTypeIdEmpty(args.ownerType) ? args.ownerType : this.#fileListReference?.ownerType,
        ownerName: !isNullOrWhiteSpace(args.ownerName) ? args.ownerName : this.#fileListReference?.ownerName,
        filesCategory: !isNullOrWhiteSpace(args.filesCategory) ? args.filesCategory : this.#fileListReference?.filesCategory,
      };

      const { file, filesCategory, ownerId } = uploadArgs;
      if (!isFile(file))
        throw new Error('File is not a file');

      if (isNullOrWhiteSpace(ownerId) && !this.#delayedUpdateClient)
        throw new Error("Delayed update client is mandatory if owner id is not defined");

      const newFile: StoredFileModel = {
        uid: fileUid,
        name: file.name,
        size: file.size,
        status: 'uploading',
        type: getFileExtension(file) ? `.${getFileExtension(file)}` : null,
        fileCategory: filesCategory ?? null,
        url: null,
        temporary: false,
        userHasDownloaded: false,
      };
      this.addFileToList(newFile);

      const responseFile = await this.#fileHelper.uploadFileAsAttachmentAsync(uploadArgs);

      this.updateFileByUid(fileUid, () => storedFileDtoToModel(responseFile));

      if (responseFile.temporary && this.#delayedUpdateClient)
        this.#delayedUpdateClient.addItem(STORED_FILES_DELAYED_UPDATE, responseFile.id, {
          ownerName: uploadArgs.ownerName,
        });

      this.#onChange?.(this.#fileList, true);
    } catch (error) {
      console.error(error);

      const errorMessage = extractErrorMessage(error);
      this.updateFileByUid(fileUid, (file) => ({ ...file, status: 'error', error: errorMessage }));
      this.#message.error(`File upload failed. ${errorMessage}`);
    }
  };

  replaceFile = async (args: ReplaceFilePayload): Promise<void> => {
    const { fileId } = args;

    try {
      // Find the file to get its persisted id if available
      const file = this.findFileById(fileId);
      if (!file) {
        throw new Error(`File with id ${fileId} not found`);
      }

      // Use the persisted id for the API call if available, otherwise use the provided id
      const persistedId = file.id || fileId;
      const replaceArgs: ReplaceFilePayload = {
        ...args,
        fileId: persistedId,
      };

      this.updateFileByIdOrUid(fileId, (file) => ({ ...file, status: 'uploading' }));

      const uploadedFile = await this.#fileHelper.replaceFileAsync(replaceArgs);

      this.updateFileByIdOrUid(fileId, () => storedFileDtoToModel(uploadedFile));

      this.#onChange?.(this.#fileList, true);

      this.#message.success(`File "${uploadedFile.name}" replaced successfully`);
    } catch (error) {
      console.error(error);

      const errorMessage = extractErrorMessage(error);
      this.updateFileByIdOrUid(fileId, (file) => ({ ...file, status: 'error', error: errorMessage }));
      this.#message.error(`File replacement failed. ${errorMessage}`);
    }
  };

  deleteFile = async (fileId: string): Promise<void> => {
    try {
      // Find the file to get its persisted id if available
      const file = this.findFileById(fileId);
      if (!file) {
        throw new Error(`File with id ${fileId} not found`);
      }

      // Use the persisted id for the API call if available, otherwise use the provided id
      const persistedId = file.id || fileId;

      this.updateFileByIdOrUid(fileId, (file) => ({ ...file, status: 'removed' }));

      await this.#fileHelper.deleteFileByIdAsync(persistedId);

      // Remove using the original fileId to handle both id and uid lookups
      this.updateFileList((files) => files.filter((f) => f.id !== fileId && f.uid !== fileId));

      if (this.#delayedUpdateClient)
        this.#delayedUpdateClient.removeItem(STORED_FILES_DELAYED_UPDATE, persistedId);

      this.#onChange?.(this.#fileList, true);
    } catch (error) {
      console.error(error);

      const errorMessage = extractErrorMessage(error);
      this.updateFileByIdOrUid(fileId, (file) => ({ ...file, status: 'error', error: errorMessage }));
      this.#message.error(`File deletion failed. ${errorMessage}`);
    }
  };

  downloadZipFile = async (): Promise<void> => {
    if (this.#fileListReference) {
      const { ownerId, ownerType, filesCategory, ownerName } = this.#fileListReference;
      await this.#fileHelper.downloadZipByOwnerAsync({ ownerId, ownerType, filesCategory, ownerName });
    } else {
      const filesId = this.#fileList.map((f) => f.id).filter((f) => !isNullOrWhiteSpace(f));
      await this.#fileHelper.downloadZipByIdsAsync({ filesId });
    }

    this.updateFileList((files) => files.map((f) => ({ ...f, userHasDownloaded: true })));
    this.#onFileDownloaded?.(this.#fileList, true);
  };

  downloadFile = async (args: DownloadFileArgs): Promise<void> => {
    // Find the file to get its persisted id if available
    const file = this.findFileById(args.fileId);
    if (!file) {
      throw new Error(`File with id ${args.fileId} not found`);
    }

    // Use the persisted id for the API call if available, otherwise use the provided id
    const persistedId = file.id || args.fileId;
    const downloadArgs: DownloadFileArgs = {
      ...args,
      fileId: persistedId,
    };

    await this.#fileHelper.downloadFileAsync(downloadArgs);
    this.updateFileByIdOrUid(args.fileId, (file) => ({ ...file, userHasDownloaded: true }));
    this.#onFileDownloaded?.(this.#fileList, true);
  };
}
