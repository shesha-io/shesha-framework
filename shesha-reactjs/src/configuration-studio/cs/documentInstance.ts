import { mapProps } from "@/utils/object";
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
    
    //constructor(definition: DocumentDefinition, itemType: string, itemId: string, label: string, moduleId: string, moduleName: string, flags?: DocumentFlags){
    constructor(args: DocumentInstanceArgs){
        mapProps(args, this, ['definition', 'itemType', 'itemId', 'label', 'moduleId', 'moduleName', 'flags']);
        
        this.isHistoryVisible = false;
    }
    toolbarForceRender?: ForceRenderFunc;
}
