import { IDocumentInstance, DocumentType, DocumentDefinition, LoadingStatus, ForceRenderFunc, DocumentFlags, DocumentInstanceFactoryArgs } from "../models";

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

  toolbarForceRender?: ForceRenderFunc;
}
