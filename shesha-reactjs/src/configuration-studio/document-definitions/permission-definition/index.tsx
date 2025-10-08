import { DocumentDefinition, ITEM_TYPES } from "@/configuration-studio/models";

import { getGenericDefinition } from "../configurable-editor/genericDefinition";

export const PermissionDocumentDefinition: DocumentDefinition = getGenericDefinition(ITEM_TYPES.PERMISSION);
