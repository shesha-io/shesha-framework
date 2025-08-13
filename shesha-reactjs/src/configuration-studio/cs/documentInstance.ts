import { IDocumentInstance, DocumentType, DocumentDefinition, LoadingStatus, ForceRenderFunc, DocumentFlags } from "../models";

export class DocumentInstance implements IDocumentInstance {
    itemId: string;
    label: string;
    type: DocumentType = 'ci';
    itemType: string;
    flags?: DocumentFlags;
    

    definition: DocumentDefinition;
    loadingState: LoadingStatus;
    isHistoryVisible: boolean;
    
    constructor(definition: DocumentDefinition, itemType: string, itemId: string, label: string, flags?: DocumentFlags){
        this.definition = definition;
        this.itemType = itemType;
        this.itemId = itemId;
        this.label = label;
        this.flags = flags;
        this.isHistoryVisible = false;
    }
    toolbarForceRender?: ForceRenderFunc;    
}
