import { HttpClientApi } from "@/publicJsApis/httpClient";
import { MessageInstance } from "antd/es/message/interface";
import { DelayedUpdateClient } from "../delayedUpdateProvider/context";
import { IStoredFileHelper, StoredFileHelper } from "../../utils/storedFile/storedFileHelper";
import { IEntityTypeIdentifier } from "../sheshaApplication/publicApi/entities/models";
import { DownloadFileArgs, FileUploadMode, OnFileUploadChanged, UploadFileArgs } from "./models";
import { FileReference, StoredFileModel } from "../../utils/storedFile/models";
import { isNullOrWhiteSpace } from "@/utils/nullables";
import { STORED_FILES_DELAYED_UPDATE } from "../delayedUpdateProvider/models";
import { extractErrorMessage } from "@/utils/errors";
import { nanoid } from "@/utils/uuid";
import { SubscribeFunc, SubscriptionManager } from "../../utils/subscriptions/subscriptionManager";
import { IFileUpload, FileUploadInitArgs } from "./contexts";
import { getFileExtension, isFileReferenceValid, storedFileDtoToModel } from "../../utils/storedFile/utils";

export type FileUploadInstanceArgs = {
  httpClient: HttpClientApi;
  message: MessageInstance;
  delayedUpdateClient: DelayedUpdateClient | undefined;
};

export type FileUploadEvents = 'file';

export class FileUploadInstance implements IFileUpload {
  fileInfo: StoredFileModel | undefined;

  #onChange: OnFileUploadChanged | undefined;

  uploadMode: FileUploadMode = 'async';

  ownerId?: string | undefined;

  ownerType?: string | IEntityTypeIdentifier | undefined;

  propertyName: string | undefined;

  fileId: string | undefined;

  #message: MessageInstance;

  #fileHelper: IStoredFileHelper;

  #delayedUpdateClient: DelayedUpdateClient | undefined;

  #subscriptionManager: SubscriptionManager<FileUploadEvents, IFileUpload>;

  constructor(args: FileUploadInstanceArgs) {
    this.#message = args.message;
    this.#delayedUpdateClient = args.delayedUpdateClient;
    this.#fileHelper = new StoredFileHelper(args.httpClient);
    this.#subscriptionManager = new SubscriptionManager<FileUploadEvents, IFileUpload>();
  }

  setOnChange = (onChange: OnFileUploadChanged | undefined): void => {
    this.#onChange = onChange;
  };

  subscribe: SubscribeFunc<FileUploadEvents, IFileUpload> = (type, callback) => {
    return this.#subscriptionManager.subscribe(type, callback);
  };

  notifySubscribers = (types: FileUploadEvents[]): void => this.#subscriptionManager.notifySubscribers(types, this);

  downloadFile = async (payload: DownloadFileArgs): Promise<void> => {
    await this.#fileHelper.downloadFileAsync(payload);
  };

  uploadFile = (args: UploadFileArgs): Promise<void> => {
    switch (this.uploadMode) {
      case 'sync':
        return this.uploadFileSync(args);
      case 'async':
        return this.uploadFileAsync(args);
    }
  };

  private makeFileModelFromFile = (file: File): StoredFileModel => ({
    uid: nanoid(),
    name: file.name,
    status: 'uploading',
    size: file.size,
    type: getFileExtension(file),
    url: null,
    temporary: false,
    userHasDownloaded: false,
    fileCategory: null,
  });

  clearFileInfo = (): void => {
    this.fileInfo = undefined;
    this.notifySubscribers(['file']);
  };

  updateFileInfo = (updater: (file: StoredFileModel | undefined) => StoredFileModel): void => {
    this.fileInfo = updater(this.fileInfo);
    this.notifySubscribers(['file']);
  };

  uploadFileAsync = async (args: UploadFileArgs): Promise<void> => {
    const { file } = args;
    const newFile = this.makeFileModelFromFile(file);
    try {
      if (isNullOrWhiteSpace(this.ownerId) && !this.#delayedUpdateClient)
        throw new Error("Delayed update client is mandatory if owner id is not defined");

      this.updateFileInfo(() => newFile);

      const responseFile = await this.#fileHelper.uploadFileAsync({
        file,
        id: this.fileId,
        ownerId: this.ownerId,
        ownerType: this.ownerType,
        propertyName: this.propertyName,
      });

      this.updateFileInfo(() => storedFileDtoToModel(responseFile));

      if (responseFile.temporary && this.#delayedUpdateClient)
        this.#delayedUpdateClient.addItem(STORED_FILES_DELAYED_UPDATE, responseFile.id, {
          propertyName: this.propertyName,
        });

      this.#onChange?.(responseFile.id);
    } catch (error) {
      console.error(error);

      const errorMessage = extractErrorMessage(error);
      this.updateFileInfo((file) => ({ ...(file ?? newFile), status: 'error', error: errorMessage }));
      this.#message.error(`File upload failed. ${errorMessage}`);
    }
  };

  uploadFileSync = (payload: UploadFileArgs): Promise<void> => {
    this.updateFileInfo(() => this.makeFileModelFromFile(payload.file));

    if (this.#onChange)
      this.#onChange(payload.file);

    return Promise.resolve();
  };

  deleteFile = (): Promise<void> => {
    switch (this.uploadMode) {
      case 'sync':
        return this.deleteFileSync();
      case 'async':
        return this.deleteFileAsync();
    }
  };

  deleteFileSync = (): Promise<void> => {
    this.clearFileInfo();

    if (this.#onChange)
      this.#onChange(null);

    return Promise.resolve();
  };

  private getValidFileReference = (): FileReference | undefined => {
    const result: FileReference = {
      ownerId: this.ownerId ?? "",
      ownerType: this.ownerType ?? "",
      propertyName: this.propertyName ?? "",
      fileId: this.fileId,
    };
    return isFileReferenceValid(result) ? result : undefined;
  };

  deleteFileAsync = async (): Promise<void> => {
    const fileReference = this.getValidFileReference();
    if (fileReference) {
      await this.#fileHelper.deleteFileByReferenceAsync(fileReference);
    } else {
      const fileId = this.fileInfo?.id;
      if (!isNullOrWhiteSpace(fileId))
        await this.#fileHelper.deleteFileByIdAsync(fileId);
      else
        throw new Error('Cannot delete file. File id or reference is not defined.');
    }

    this.clearFileInfo();
  };

  init = (args: FileUploadInitArgs): void => {
    this.ownerId = args.ownerId;
    this.ownerType = args.ownerType;
    this.propertyName = args.propertyName;
    this.fileId = args.fileId;
    this.uploadMode = args.uploadMode;

    // TODO: check current state and sync if required
    if (this.uploadMode === 'async')
      void this.fetchFileInfo();
  };

  fetchFileInfo = async (): Promise<void> => {
    if (this.fileId) {
      await this.#fileHelper.fetchFileInfoByIdAsync(this.fileId);
      return;
    }

    const filereference = this.getValidFileReference();
    if (filereference) {
      await this.#fileHelper.fetchFileInfoByReferenceAsync(filereference);
      return;
    }
  };
}
