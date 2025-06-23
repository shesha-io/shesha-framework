import { IDocumentInstance, DocumentType, DocumentDefinition, LoadingStatus } from "../models";

export class DocumentInstance implements IDocumentInstance {
    itemId: string;
    label: string;
    type: DocumentType = 'ci';
    itemType: string;

    definition: DocumentDefinition;
    loadingState: LoadingStatus;
    isHistoryVisible: boolean;

    constructor(definition: DocumentDefinition, itemType: string, itemId: string, label: string){
        this.definition = definition;
        this.itemType = itemType;
        this.itemId = itemId;
        this.label = label;
        this.isHistoryVisible = false;
    }
}
