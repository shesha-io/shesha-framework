import { DocumentDefinition, ITEM_TYPES } from "@/configuration-studio/models";

import { getGenericDefinition } from "../configurable-editor/genericDefinition";

export const NotificationDocumentDefinition: DocumentDefinition = getGenericDefinition(ITEM_TYPES.NOTIFICATION, {
  formId: { module: 'Shesha', name: 'cs-notification-type-editor' },
});
