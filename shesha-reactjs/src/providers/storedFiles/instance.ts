import { DownloadFileArgs, FileListReference, ReplaceFilePayload, StoredFileModel, UploadFileAsAttachmentArgs } from "../../utils/storedFile/models";
import { HttpClientApi } from "@/publicJsApis/httpClient";
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
  };

  init = (fileListReference: FileListReference): void => {
    // skip initialization if it is already initialized with the same reference
    if (isDefined(this.#fileListReference) && fileListReferenceEqual(this.#fileListReference, fileListReference))
      return;

    this.#fileListReference = fileListReference;
    if (isOwnerReferenceValid(this.#fileListReference))
      this.fetchFilesList();
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

  private removeFileFromList = (fileId: string): void => {
    this.updateFileList((files) => files.filter((f) => f.id !== fileId));
  };

  private addFileToList = (file: StoredFileModel): void => {
    this.updateFileList((files) => [...files, file]);
  };

  private updateFileByUid = (uid: string, updater: (file: StoredFileModel) => StoredFileModel): void => {
    this.updateFileList((files) => files.map((f) => (f.uid === uid ? updater(f) : f)));
  };

  uploadFile = async (args: UploadFileAsAttachmentArgs): Promise<void> => {
    const fileUid = nanoid();
    try {
      const { file, filesCategory, ownerId } = args;

      if (isNullOrWhiteSpace(ownerId) && !this.#delayedUpdateClient)
        throw new Error("Delayed update client is mandatory if owner id is not defined");

      const newFile: StoredFileModel = {
        uid: fileUid,
        name: file.name,
        status: 'uploading',

        type: getFileExtension(file),
        fileCategory: filesCategory ?? null,
        url: null,
        temporary: false,
        userHasDownloaded: false,
      };
      this.addFileToList(newFile);

      const responseFile = await this.#fileHelper.uploadFileAsAttachmentAsync(args);

      this.updateFileByUid(fileUid, () => storedFileDtoToModel(responseFile));

      if (responseFile.temporary && this.#delayedUpdateClient)
        this.#delayedUpdateClient.addItem(STORED_FILES_DELAYED_UPDATE, responseFile.id, {
          ownerName: args.ownerName,
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
      this.updateFileByUid(fileId, (file) => ({ ...file, status: 'uploading' }));

      const uploadedFile = await this.#fileHelper.replaceFileAsync(args);

      this.updateFileByUid(fileId, () => storedFileDtoToModel(uploadedFile));

      this.#onChange?.(this.#fileList, true);

      this.#message.success(`File "${uploadedFile.name}" replaced successfully`);
    } catch (error) {
      console.error(error);

      const errorMessage = extractErrorMessage(error);
      this.updateFileByUid(fileId, (file) => ({ ...file, status: 'error', error: errorMessage }));
      this.#message.error(`File replacement failed. ${errorMessage}`);
    }
  };

  deleteFile = async (fileId: string): Promise<void> => {
    try {
      this.updateFileByUid(fileId, (file) => ({ ...file, status: 'removed' }));

      await this.#fileHelper.deleteFileByIdAsync(fileId);

      this.removeFileFromList(fileId);

      if (this.#delayedUpdateClient)
        this.#delayedUpdateClient.removeItem(STORED_FILES_DELAYED_UPDATE, fileId);

      this.#onChange?.(this.#fileList, true);
    } catch (error) {
      console.error(error);

      const errorMessage = extractErrorMessage(error);
      this.updateFileByUid(fileId, (file) => ({ ...file, status: 'error', error: errorMessage }));
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
    await this.#fileHelper.downloadFileAsync(args);
    this.updateFileByUid(args.fileId, (file) => ({ ...file, userHasDownloaded: true }));
    this.#onFileDownloaded?.(this.#fileList, true);
  };
}
