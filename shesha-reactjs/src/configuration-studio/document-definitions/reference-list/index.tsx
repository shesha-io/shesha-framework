import { DocumentDefinition } from "@/configuration-studio/models";
import { ITEM_TYPES } from "@/configuration-studio/models";
import { getGenericDefinition } from "../configurable-editor/genericDefinition";

export const ReferenceListDocumentDefinition: DocumentDefinition = getGenericDefinition(ITEM_TYPES.REFLIST, {
    formId: { module: 'Shesha', name: 'cs-reflist-editor' },
});
