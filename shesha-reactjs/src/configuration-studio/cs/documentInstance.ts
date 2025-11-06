import { IDocumentInstance, DocumentType, DocumentDefinition, LoadingStatus, ForceRenderFunc, DocumentFlags, DocumentInstanceFactoryArgs, DocumentLoader, DocumentSaver } from "../models";

export type DocumentInstanceArgs = DocumentInstanceFactoryArgs & {
  definition: DocumentDefinition;
  itemType: string;
};

export class DocumentInstance implements IDocumentInstance {
  itemId: string;

  label: string;

  type: DocumentType = 'ci';

  itemType: string;

  flags: DocumentFlags;

  moduleId: string;

  moduleName: string;

  definition: DocumentDefinition;

  loadingState: LoadingStatus;

  isDataModified: boolean = false;

  isHistoryVisible: boolean;

  constructor(args: DocumentInstanceArgs) {
    this.definition = args.definition;
    this.itemType = args.itemType;
    this.itemId = args.itemId;
    this.label = args.label;
    this.moduleId = args.moduleId;
    this.moduleName = args.moduleName;
    this.flags = args.flags ?? {
      isCodeBased: false,
      isCodegenPending: false,
      isUpdated: false,
      isUpdatedByMe: false,
      isExposed: false,
    };
    this.loadingState = 'waiting';

    this.isHistoryVisible = false;
  }

  private _loader: DocumentLoader | undefined = undefined;

  setLoader = (loader: DocumentLoader | undefined): void => {
    this._loader = loader;
  };

  reloadDocumentAsync = async (): Promise<void> => {
    if (this._loader) {
      this.loadingState = 'loading';
      try {
        await this._loader();
      } catch (error) {
        this.loadingState = 'failed';
        throw error;
      }
      this.loadingState = 'ready';
    } else
      this.loadingState = 'ready';
  };

  private _saver: DocumentSaver | undefined = undefined;

  setSaver = (saver: DocumentSaver | undefined): void => {
    this._saver = saver;
  };

  saveAsync = async (): Promise<void> => {
    if (!this._saver)
      throw new Error('Saver is not defined');

    await this._saver();
  };

  toolbarForceRender?: ForceRenderFunc;
}
