import { DocumentDefinition, ITEM_TYPES } from "@/configuration-studio/models";

import { getGenericDefinition } from "../configurable-editor/genericDefinition";

export const RoleDocumentDefinition: DocumentDefinition = getGenericDefinition(ITEM_TYPES.ROLE);
